import { ActionButton } from '@/super-action/button/ActionButton'
import { revalidatePath } from 'next/cache'
import { CredentialsForm } from './CredentialsForm'
import { signIn } from './auth'

export const LoginDialog = () => {
  return (
    <>
      <CredentialsForm
        onSubmit={async (credentials) => {
          'use server'
          const result = await signIn('credentials', {
            ...credentials,
            redirect: false,
          })
          console.log(result)
          revalidatePath('/', 'layout')
        }}
      />

      <div className="flex flex-row items-center my-4">
        <hr className="flex-1" />
        <span className="mx-4 text-border">or</span>
        <hr className="flex-1" />
      </div>

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
  )
}
