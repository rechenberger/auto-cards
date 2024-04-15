import { superAction } from '@/super-action/action/createSuperAction'
import { ChangePasswordFormClient } from './ChangePasswordFormClient'
import { getMyUser, getMyUserId } from './getMyUser'

export const ChangePasswordForm = async ({
  redirectUrl,
}: {
  redirectUrl?: string
}) => {
  const user = await getMyUser()
  return (
    <>
      <ChangePasswordFormClient
        action={async (data) => {
          'use server'
          return superAction(async () => {
            const userId = await getMyUserId()
            // const passwordHash = await db.query.users
            // db.update(schema.users).set()
          })
        }}
        email={user?.email}
        redirectUrl={redirectUrl}
      />
    </>
  )
}
