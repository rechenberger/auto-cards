import { superAction } from '@/super-action/action/createSuperAction'
import { ChangePasswordFormClient } from './ChangePasswordFormClient'
import { getMyUser } from './getMyUser'

export const ChangePasswordForm = async () => {
  const user = await getMyUser()
  return (
    <>
      <ChangePasswordFormClient
        action={async (data) => {
          'use server'
          return superAction(async () => {
            throw new Error('Not implemented')
          })
        }}
        email={user?.email}
      />
    </>
  )
}
