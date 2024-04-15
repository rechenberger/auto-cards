import { ActionButton } from '@/super-action/button/ActionButton'
import { CredentialsForm } from './CredentialsForm'
import { signIn } from './auth'

export const LoginDialog = () => {
  return (
    <>
      <CredentialsForm
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
