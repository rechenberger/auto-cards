import { superAction } from '@/super-action/action/createSuperAction'
import { ChangePasswordFormClient } from './ChangePasswordFormClient'
import { changePassword } from './changePassword'
import { getMyUser, getMyUserIdOrThrow } from './getMyUser'

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
            const userId = await getMyUserIdOrThrow()
            await changePassword({
              password: data.password,
              userId,
            })
          })
        }}
        email={user?.email}
        redirectUrl={redirectUrl}
      />
    </>
  )
}
