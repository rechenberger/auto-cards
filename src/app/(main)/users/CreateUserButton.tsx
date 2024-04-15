import { LoginForm } from '@/auth/LoginForm'
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
                  <LoginForm
                    action={async (credentials) => {
                      'use server'
                      await registerUser(credentials)
                      revalidatePath('/users')
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
