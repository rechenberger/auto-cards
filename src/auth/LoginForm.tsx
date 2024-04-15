import { superAction } from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { CredentialsSignin } from 'next-auth'
import { LoginFormClient } from './LoginFormClient'
import { signIn } from './auth'
import { registerUser } from './registerUser'

export const LoginForm = () => {
  return (
    <>
      <LoginFormClient
        action={async (data) => {
          'use server'
          return superAction(async () => {
            if (data.type === 'login') {
              // LOGIN
              try {
                await signIn('credentials', data)
              } catch (error) {
                if (error instanceof CredentialsSignin) {
                  throw new Error('Invalid credentials')
                } else {
                  throw error
                }
              }
              return
            } else if (data.type === 'register') {
              // REGISTER
              await registerUser(data)
              await signIn('resend', data)
            } else if (data.type === 'forgotPassword') {
              // CHANGE PASSWORD
              await signIn('resend', {
                email: data.email,
              })
            } else {
              const exhaustiveCheck: never = data
            }
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
