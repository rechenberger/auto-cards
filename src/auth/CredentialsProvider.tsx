import { db } from '@/db/db'
import Credentials from '@auth/core/providers/credentials'
import { CredentialsSignin } from 'next-auth'
import { sql } from 'drizzle-orm'
import { credentialsSchema } from './credentialsSchema'
import { comparePasswords } from './password'

export class EmailNotVerifiedAuthorizeError extends CredentialsSignin {
  code = 'email_not_verified'
}
export const CredentialsProvider = Credentials({
  credentials: {
    email: {},
    password: {},
  },
  authorize: async (credentialsRaw) => {
    const parsed = credentialsSchema.safeParse(credentialsRaw)
    if (!parsed.success) {
      throw new CredentialsSignin()
    }
    const credentials = parsed.data
    const email = credentials.email.toLowerCase()

    const user = await db.query.users.findFirst({
      where: (s, { and, isNotNull }) =>
        and(sql`lower(${s.email}) = ${email}`, isNotNull(s.passwordHash)),
    })

    if (!user || !user.passwordHash) {
      throw new CredentialsSignin()
    }

    const correctPassword = await comparePasswords({
      password: credentials.password,
      hash: user.passwordHash,
    })
    if (!correctPassword) {
      throw new CredentialsSignin()
    }

    if (!user.emailVerified) {
      throw new EmailNotVerifiedAuthorizeError()
    }

    return {
      id: user?.id,
      name: user?.name,
      email: user?.email,
      image: user?.image,
    }
  },
})
