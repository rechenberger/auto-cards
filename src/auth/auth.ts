import { db } from '@/db/db'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import NextAuth from 'next-auth'
import Discord from 'next-auth/providers/discord'
import Resend from 'next-auth/providers/resend'
import { headers } from 'next/headers'
import { CredentialsProvider } from './CredentialsProvider'
import { ImpersonateProvider } from './ImpersonateProvider'
import { sendVerificationRequestEmail } from './sendVerificationRequestEmail'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    Discord,
    Resend({
      from: process.env.EMAIL_FROM,
      apiKey: process.env.AUTH_RESEND_KEY,

      sendVerificationRequest: async (params) => {
        const h = headers()
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
