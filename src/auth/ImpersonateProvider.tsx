import { db } from '@/db/db'
import Credentials from '@auth/core/providers/credentials'
import { CredentialsSignin } from 'next-auth'
import { z } from 'zod'

export const ImpersonateProvider = Credentials({
  id: 'impersonate',
  credentials: {
    userId: {},
    secret: {},
  },
  authorize: async (credentialsRaw) => {
    const parsed = z
      .object({
        userId: z.string().min(1),
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
      where: (s, { eq }) => eq(s.id, credentials.userId),
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
