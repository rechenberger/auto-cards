import { db } from '@/db/db'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import NextAuth from 'next-auth'
import Discord from 'next-auth/providers/discord'
import { CredentialsProvider } from './CredentialsProvider'
import { ImpersonateProvider } from './ImpersonateProvider'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    Discord,
    // Nodemailer({
    //   from: process.env.EMAIL_FROM,
    //   server: process.env.SMTP_URL,

    //   sendVerificationRequest: async (params) => {
    //     const h = headers()
    //     const baseUrl = h.get('Origin')

    //     const url = `${baseUrl}/auth/verify-email?redirect=${encodeURIComponent(
    //       params.url,
    //     )}`

    //     await sendVerificationRequestEmail({
    //       ...params,
    //       theme: { brandColor: '#79a913' },
    //       url,
    //     })
    //   },
    // }),
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
