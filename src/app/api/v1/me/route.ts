import { auth } from '@/auth/auth'
import { hashPassword } from '@/auth/password'
import { UpdateMeRequest } from '@/contracts/auth-api'
import { db } from '@/db/db'
import { users } from '@/db/schema-auth'
import { badRequest, notFound } from '@/server/api/ApiError'
import { apiData, apiRoute } from '@/server/api/route'
import { getMe } from '@/server/application/auth/getMe'
import { requireApiSession } from '@/server/auth/apiPrincipal'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export const GET = apiRoute(async () => {
  const session = await auth()
  const userId = session?.user?.id
  const me = userId ? await getMe(userId) : null
  return apiData(me, {
    headers: {
      'Cache-Control': 'private, no-store',
      Vary: 'Cookie',
    },
  })
})

export const PATCH = apiRoute(async (_context, request: Request) => {
  const principal = await requireApiSession({ allowDevAdmin: true })
  const body: unknown = await request.json().catch(() => null)
  const parsed = UpdateMeRequest.safeParse(body)
  if (!parsed.success) {
    throw badRequest('Invalid account update', parsed.error.flatten())
  }

  const update = parsed.data
  switch (update.type) {
    case 'username':
      await db
        .update(users)
        .set({ name: update.username })
        .where(eq(users.id, principal.userId))
      break
    case 'password':
      await db
        .update(users)
        .set({
          passwordHash: await hashPassword({ password: update.password }),
        })
        .where(eq(users.id, principal.userId))
      break
    case 'theme':
      await db
        .update(users)
        .set({ themeId: update.themeId })
        .where(eq(users.id, principal.userId))
      break
  }

  const me = await getMe(principal.userId)
  if (!me) throw notFound('User not found')
  return apiData(me, { headers: { 'Cache-Control': 'private, no-store' } })
})
