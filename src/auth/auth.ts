import { db } from '@/db/db'
import Nodemailer from '@auth/core/providers/nodemailer'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import NextAuth from 'next-auth'
import Discord from 'next-auth/providers/discord'
import { headers } from 'next/headers'
import { CredentialsProvider } from './CredentialsProvider'
import { ImpersonateProvider } from './ImpersonateProvider'
import { sendVerificationRequestEmail } from './sendVerificationRequestEmail'

const hasEmailEnvVars = !!process.env.EMAIL_FROM && !!process.env.SMTP_URL

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    Discord,
    ...((hasEmailEnvVars
      ? [
          Nodemailer({
            from: process.env.EMAIL_FROM,
            server: process.env.SMTP_URL,

            sendVerificationRequest: async (params) => {
              const h = await headers()
              const baseUrl = h.get('Origin')

              const url = `${baseUrl}/auth/verify-email?redirect=${encodeURIComponent(
                params.url,
              )}`

              await sendVerificationRequestEmail({
                ...params,
                theme: { brandColor: '#79a913' },
                url,
              })
            },
          }),
        ]
      : []) as any), // TODO: FIXME: looks like a type bug in next-auth
    CredentialsProvider,
    ImpersonateProvider,
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub as string
      }
      return session
    },
  },
})
