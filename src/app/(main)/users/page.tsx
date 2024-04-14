import { notFoundIfNotAdmin } from '@/auth/getIsAdmin'
import { SimpleDataCard } from '@/components/simple/SimpleDataCard'
import { db } from '@/db/db'
import { users as usersTable } from '@/db/schema-auth'
import { showToast, superAction } from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { eq } from 'drizzle-orm'
import { Metadata } from 'next'
import { revalidatePath } from 'next/cache'
import { Fragment } from 'react'

export const metadata: Metadata = {
  title: 'Users',
}

export default async function Page() {
  await notFoundIfNotAdmin({ allowDev: true })
  const users = await db.query.users.findMany({})
  return (
    <>
      <div className="grid grid-cols-[1fr_auto] gap-4">
        {users.map((user) => {
          const isAdmin = !!user.isAdmin
          return (
            <Fragment key={user.id}>
              <SimpleDataCard data={user} />
              <div>
                <ActionButton
                  variant={isAdmin ? 'destructive' : 'default'}
                  action={async () => {
                    'use server'
                    return superAction(async () => {
                      await db
                        .update(usersTable)
                        .set({ isAdmin: !isAdmin })
                        .where(eq(usersTable.id, user.id))
                      showToast({
                        title: isAdmin ? 'Removed admin' : 'Made admin',
                        description: `User ${user.email} is now ${
                          isAdmin ? 'not' : ''
                        } an admin`,
                      })
                      revalidatePath('/users')
                    })
                  }}
                >
                  {isAdmin ? 'Remove admin' : 'Make admin'}
                </ActionButton>
              </div>
            </Fragment>
          )
        })}
      </div>
    </>
  )
}
