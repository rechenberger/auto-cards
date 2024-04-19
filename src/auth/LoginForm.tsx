import {
  streamDialog,
  superAction,
} from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { CredentialsSignin } from 'next-auth'
import { EmailNotVerifiedAuthorizeError } from './CredentialsProvider'
import { LoginFormClient } from './LoginFormClient'
import { signIn } from './auth'
import { registerUser } from './registerUser'

export const LoginForm = ({ redirectUrl }: { redirectUrl?: string }) => {
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
                } else if (error instanceof EmailNotVerifiedAuthorizeError) {
                  // throw new Error('Email not verified')
                  streamDialog({
                    title: 'Email not verified',
                    content: (
                      <>
                        <p>
                          We sent you another verification email to
                          {data.email}.
                        </p>
                        <p>
                          Please open the email and click sign in to verify your
                          email.
                        </p>
                      </>
                    ),
                  })
                  await signIn('resend', { email: data.email, redirect: false })
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
              let redirectTo = '/auth/change-password'
              if (redirectUrl) {
                redirectTo += `?redirect=${encodeURIComponent(redirectUrl)}`
              }
              await signIn('resend', {
                email: data.email,
                redirectTo,
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
              Continue with Discord
            </ActionButton>
            {/* <ActionButton
              variant={'outline'}
              action={async () => {
                'use server'
                await signIn()
              }}
            >
              Sign in Page
            </ActionButton> */}
          </>
        }
      />
    </>
  )
}
