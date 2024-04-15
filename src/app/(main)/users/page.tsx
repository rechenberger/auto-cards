import { notFoundIfNotAdmin, throwIfNotAdmin } from '@/auth/getIsAdmin'
import { impersonate } from '@/auth/impersonate'
import { LocalDateTime } from '@/components/demo/LocalDateTime'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { db } from '@/db/db'
import { users as usersTable } from '@/db/schema-auth'
import {
  streamToast,
  superAction,
} from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { eq } from 'drizzle-orm'
import { Metadata } from 'next'
import { revalidatePath } from 'next/cache'
import { Fragment } from 'react'
import { CreateUserButton } from './CreateUserButton'

export const metadata: Metadata = {
  title: 'Users',
}

export default async function Page() {
  await notFoundIfNotAdmin({ allowDev: true })
  const users = await db.query.users.findMany({
    with: {
      accounts: true,
    },
  })

  return (
    <>
      <div className="flex flex-row gap-2 items-center">
        <CardTitle className="flex-1">Users</CardTitle>
        <CreateUserButton />
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        {users.map((user) => {
          const isAdmin = !!user.isAdmin
          const tags: string[] = []
          if (user.passwordHash) tags.push('password')
          for (const account of user.accounts) {
            tags.push(account.provider)
          }
          return (
            <Fragment key={user.id}>
              <Card>
                <CardHeader>
                  <CardTitle>{user.name ?? user.email}</CardTitle>
                  <CardDescription>{user.id}</CardDescription>
                  {tags.length && (
                    <div className="flex flex-row gap-2">
                      {tags.map((tag) => (
                        <Fragment key={tag}>
                          <div className="bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-xs">
                            {tag}
                          </div>
                        </Fragment>
                      ))}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div>
                    <div>{user.email}</div>
                    <div className="text-muted-foreground">
                      {user.emailVerified ? (
                        <>
                          Verified{' '}
                          <LocalDateTime
                            datetime={user.emailVerified.toISOString()}
                          />
                        </>
                      ) : (
                        <>Not verified</>
                      )}
                    </div>
                  </div>
                  <label className="">
                    <div className="flex-1">Admin</div>
                    <ActionButton
                      component={Switch}
                      checked={isAdmin}
                      action={async () => {
                        'use server'
                        return superAction(async () => {
                          await db
                            .update(usersTable)
                            .set({ isAdmin: !isAdmin })
                            .where(eq(usersTable.id, user.id))
                          streamToast({
                            title: isAdmin ? 'Removed admin' : 'Made admin',
                            description: `User ${user.email} is now ${
                              isAdmin ? 'not' : ''
                            } an admin`,
                          })
                          revalidatePath('/users')
                        })
                      }}
                      command={{
                        label: `${isAdmin ? 'Remove' : 'Make'} admin: ${
                          user.email
                        }`,
                      }}
                    />
                  </label>
                  <div className="flex flex-row gap-2 items-center justify-end">
                    <ActionButton
                      variant={'outline'}
                      askForConfirmation
                      action={async () => {
                        'use server'
                        return superAction(async () => {
                          await throwIfNotAdmin({ allowDev: true })
                          await db
                            .delete(usersTable)
                            .where(eq(usersTable.id, user.id))
                            .execute()
                          streamToast({
                            title: 'User deleted',
                            description: `Bye ${user.email} 👋`,
                          })
                          revalidatePath('/users')
                        })
                      }}
                      command={{
                        label: `${isAdmin ? 'Remove' : 'Make'} admin: ${
                          user.email
                        }`,
                      }}
                    >
                      Delete
                    </ActionButton>
                    <ActionButton
                      variant={'outline'}
                      action={async () => {
                        'use server'
                        return superAction(async () => {
                          await throwIfNotAdmin({ allowDev: true })
                          await impersonate({ userId: user.id })
                        })
                      }}
                    >
                      Login as
                    </ActionButton>
                  </div>
                </CardContent>
              </Card>
            </Fragment>
          )
        })}
      </div>
    </>
  )
}
