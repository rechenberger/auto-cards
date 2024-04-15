import { db } from '@/db/db'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import NextAuth from 'next-auth'
import Discord from 'next-auth/providers/discord'
import Resend from 'next-auth/providers/resend'
import { CredentialsProvider } from './CredentialsProvider'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    Discord,
    Resend({
      from: process.env.EMAIL_FROM,
    }),
    CredentialsProvider,
  ],
  session: {
    strategy: 'jwt',
  },
})
