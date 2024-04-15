import { db } from '@/db/db'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import NextAuth from 'next-auth'
import Discord from 'next-auth/providers/discord'
import Resend from 'next-auth/providers/resend'
import { CredentialsProvider } from './CredentialsProvider'
import { ImpersonateProvider } from './ImpersonateProvider'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    Discord,
    Resend({
      from: process.env.EMAIL_FROM,
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
