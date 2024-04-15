import { ActionButton } from '@/super-action/button/ActionButton'
import { LoginForm } from './LoginForm'
import { signIn } from './auth'

export const LoginDialog = () => {
  return (
    <>
      <LoginForm
        onSubmit={async (credentials) => {
          'use server'
          await signIn('credentials', {
            ...credentials,
            // redirect: false,
          })
        }}
        alternatives={
          <>
            <ActionButton
              variant={'outline'}
              action={async () => {
                'use server'
                await signIn('discord')
              }}
            >
              Sign in with Discord
            </ActionButton>
            <ActionButton
              variant={'outline'}
              action={async () => {
                'use server'
                await signIn()
              }}
            >
              Sign in Page
            </ActionButton>
          </>
        }
      />
    </>
  )
}
