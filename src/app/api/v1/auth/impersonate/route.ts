import { ImpersonateGrant, ImpersonateRequest } from '@/contracts/auth-api'
import { db } from '@/db/db'
import { users } from '@/db/schema-auth'
import { badRequest, forbidden, notFound } from '@/server/api/ApiError'
import { apiData, apiRoute } from '@/server/api/route'
import { requireApiSession } from '@/server/auth/apiPrincipal'
import { createImpersonationToken } from '@/server/auth/impersonationToken'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export const POST = apiRoute(async (_context, request: Request) => {
  // Impersonation can mint a new browser session, so it deliberately requires
  // an existing admin session and can never be used to extend a PAT's lifetime.
  const principal = await requireApiSession({ allowDevAdmin: true })
  if (!principal.isAdmin) throw forbidden('Admin access required')
  const body: unknown = await request.json().catch(() => null)
  const parsed = ImpersonateRequest.safeParse(body)
  if (!parsed.success) {
    throw badRequest('Invalid impersonation target', parsed.error.flatten())
  }

  const target = await db.query.users.findFirst({
    columns: { id: true },
    where: eq(users.id, parsed.data.userId),
  })
  if (!target) throw notFound('User not found')

  const grant = createImpersonationToken({
    targetUserId: target.id,
    issuedByUserId: principal.userId,
  })
  return apiData(
    ImpersonateGrant.parse({
      token: grant.token,
      expiresAt: grant.expiresAt.toISOString(),
    }),
    { headers: { 'Cache-Control': 'private, no-store' } },
  )
})
