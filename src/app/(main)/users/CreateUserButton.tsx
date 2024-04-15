import { LoginFormClient } from '@/auth/LoginFormClient'
import { registerUser } from '@/auth/registerUser'
import {
  streamDialog,
  superAction,
} from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { revalidatePath } from 'next/cache'

export const CreateUserButton = () => {
  return (
    <>
      <ActionButton
        action={async () => {
          'use server'
          return superAction(async () => {
            streamDialog({
              title: 'Create User',
              content: (
                <>
                  <LoginFormClient
                    action={async (credentials) => {
                      'use server'
                      return superAction(async () => {
                        if (credentials.type === 'forgotPassword') {
                          throw new Error('Invalid type')
                        }
                        await registerUser(credentials)
                        revalidatePath('/users')
                      })
                    }}
                  />
                </>
              ),
            })
          })
        }}
      >
        Create User
      </ActionButton>
    </>
  )
}
