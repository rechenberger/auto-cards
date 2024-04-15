import { db } from '@/db/db'
import Credentials from '@auth/core/providers/credentials'
import { CredentialsSignin } from 'next-auth'
import { z } from 'zod'

export const ImpersonateProvider = Credentials({
  id: 'impersonate',
  credentials: {
    email: {},
    secret: {},
  },
  authorize: async (credentialsRaw) => {
    const parsed = z
      .object({
        email: z.string().email(),
        secret: z.string().min(1),
      })
      .safeParse(credentialsRaw)
    if (!parsed.success) {
      throw new CredentialsSignin()
    }
    const credentials = parsed.data

    if (credentials.secret !== process.env.AUTH_SECRET) {
      throw new CredentialsSignin()
    }

    const user = await db.query.users.findFirst({
      where: (s, { eq, and, isNotNull }) =>
        and(eq(s.email, credentials.email), isNotNull(s.passwordHash)),
    })

    if (!user) {
      throw new CredentialsSignin()
    }

    return {
      id: user?.id,
      name: user?.name,
      email: user?.email,
      image: user?.image,
    }
  },
})
