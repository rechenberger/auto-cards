import {
  streamToast,
  superAction,
} from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { CredentialsSignin } from 'next-auth'
import { LoginForm } from './LoginForm'
import { signIn } from './auth'

export const LoginDialog = () => {
  return (
    <>
      <LoginForm
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
            } else {
              // REGISTER
              await new Promise((resolve) => setTimeout(resolve, 1000))
              streamToast({
                title: 'Registered',
                description: 'You have been registered',
              })
              throw new Error('Not implemented')
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
