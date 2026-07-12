import { isDev } from '@/auth/dev'
import { db } from '@/db/db'
import { users } from '@/db/schema-auth'
import { verifyImpersonationToken } from '@/server/auth/impersonationToken'
import Credentials from '@auth/core/providers/credentials'
import { CredentialsSignin } from 'next-auth'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

export const ImpersonateProvider = Credentials({
  id: 'impersonate',
  credentials: {
    token: {},
  },
  authorize: async (credentialsRaw) => {
    const parsed = z
      .object({
        token: z.string().min(1),
      })
      .safeParse(credentialsRaw)
    if (!parsed.success) {
      throw new CredentialsSignin()
    }
    const token = verifyImpersonationToken(parsed.data.token)
    if (!token) {
      throw new CredentialsSignin()
    }

    const issuer = await db.query.users.findFirst({
      columns: { id: true, isAdmin: true },
      where: eq(users.id, token.issuedByUserId),
    })
    if (!issuer || (!issuer.isAdmin && !isDev())) {
      throw new CredentialsSignin()
    }

    const user = await db.query.users.findFirst({
      where: (s, { eq }) => eq(s.id, token.targetUserId),
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
