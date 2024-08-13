import {
  streamToast,
  superAction,
} from '@/super-action/action/createSuperAction'
import { redirect } from 'next/navigation'
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

            const description = redirectUrl
              ? 'Redirecting...'
              : 'Your password has been changed'

            streamToast({
              title: 'Password Changed!',
              description,
            })

            if (redirectUrl) {
              await new Promise((res) => setTimeout(res, 2000))
            }
            redirect(redirectUrl || '/')
          })
        }}
        email={user?.email}
        redirectUrl={redirectUrl}
      />
    </>
  )
}
