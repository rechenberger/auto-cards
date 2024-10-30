import { getAllUsersCached } from '@/auth/getAllUsers'
import { notFoundIfNotAdmin, throwIfNotAdmin } from '@/auth/getIsAdmin'
import { impersonate } from '@/auth/impersonate'
import { revalidateUserCache } from '@/auth/user-cache'
import { LocalDateTime } from '@/components/demo/LocalDateTime'
import { SimpleParamSelect } from '@/components/simple/SimpleParamSelect'
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
import { getUserName } from '@/game/getUserName'
import {
  streamToast,
  superAction,
} from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { ActionWrapper } from '@/super-action/button/ActionWrapper'
import { eq } from 'drizzle-orm'
import { Metadata } from 'next'
import { Fragment } from 'react'
import { CreateUserButton } from './CreateUserButton'

export const metadata: Metadata = {
  title: 'Users',
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    filter?: 'admins'
  }>
}) {
  const { filter } = await searchParams
  await notFoundIfNotAdmin({ allowDev: true })
  const users = await getAllUsersCached({
    onlyAdmins: filter === 'admins',
  })

  return (
    <>
      <div className="flex flex-col md:flex-row gap-2 items-center">
        <CardTitle className="flex-1">Users</CardTitle>
        <SimpleParamSelect
          paramKey="filter"
          component="tabs"
          options={[
            { value: null, label: 'All Users' },
            { value: 'admins', label: 'Admins' },
          ]}
        />
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
                  <CardTitle>{getUserName({ user })}</CardTitle>
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
                            datetime={new Date(
                              user.emailVerified,
                            ).toISOString()}
                          />
                        </>
                      ) : (
                        <>Not verified</>
                      )}
                    </div>
                  </div>
                  <div>
                    <div>Theme</div>
                    <div className="text-muted-foreground">
                      {user.themeId ?? '-'}
                    </div>
                  </div>
                  <label className="">
                    <div className="flex-1">Admin</div>
                    <ActionWrapper
                      askForConfirmation
                      action={async () => {
                        'use server'
                        return superAction(async () => {
                          await db
                            .update(usersTable)
                            .set({ isAdmin: !isAdmin })
                            .where(eq(usersTable.id, user.id))

                          revalidateUserCache()

                          streamToast({
                            title: isAdmin ? 'Removed admin' : 'Made admin',
                            description: `User ${user.email} is now ${
                              isAdmin ? 'not' : ''
                            } an admin`,
                          })
                        })
                      }}
                      command={{
                        label: `${isAdmin ? 'Remove' : 'Make'} admin: ${
                          user.email
                        }`,
                      }}
                    >
                      <Switch checked={isAdmin} />
                    </ActionWrapper>
                  </label>
                  <div className="flex flex-row gap-2 items-center justify-end">
                    <ActionButton
                      variant={'outline'}
                      askForConfirmation={{
                        title: 'Really delete?',
                        content: `This will delete the user ${user.email}`,
                        confirm: 'Delete user',
                        cancel: 'Cancel',
                      }}
                      action={async () => {
                        'use server'
                        return superAction(async () => {
                          await throwIfNotAdmin({ allowDev: true })
                          await db
                            .delete(usersTable)
                            .where(eq(usersTable.id, user.id))
                            .execute()

                          revalidateUserCache()

                          streamToast({
                            title: 'User deleted',
                            description: `Bye ${user.email} 👋`,
                          })
                        })
                      }}
                      command={{
                        label: `Delete user: ${user.email}`,
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
