import {
  ApiTokenListDto,
  ApiTokenScope,
  CreateApiTokenRequest,
  CreatedApiTokenDto,
} from '@/contracts/api-token'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { badRequest, forbidden } from '@/server/api/ApiError'
import { apiData, apiRoute } from '@/server/api/route'
import { toApiTokenDto } from '@/server/application/auth/apiTokenDto'
import { createApiTokenSecret } from '@/server/auth/apiToken'
import { requireApiSession } from '@/server/auth/apiPrincipal'
import { createId } from '@paralleldrive/cuid2'
import { desc, eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

const commonScopes = ApiTokenScope.options.filter((scope) => scope !== 'admin')

export const GET = apiRoute(async () => {
  const principal = await requireApiSession({ allowDevAdmin: true })
  const tokens = await db.query.apiToken.findMany({
    where: eq(schema.apiToken.userId, principal.userId),
    orderBy: desc(schema.apiToken.createdAt),
  })

  return apiData(
    ApiTokenListDto.parse({
      tokens: tokens.map(toApiTokenDto),
      availableScopes: principal.isAdmin ? ApiTokenScope.options : commonScopes,
    }),
    { headers: { 'Cache-Control': 'private, no-store', Vary: 'Cookie' } },
  )
})

export const POST = apiRoute(async (_context, request: Request) => {
  const principal = await requireApiSession({ allowDevAdmin: true })
  const body: unknown = await request.json().catch(() => null)
  const parsed = CreateApiTokenRequest.safeParse(body)
  if (!parsed.success) {
    throw badRequest('Invalid API token input', parsed.error.flatten())
  }
  if (parsed.data.scopes.includes('admin') && !principal.isAdmin) {
    throw forbidden('Only administrators can grant the admin scope')
  }

  const now = new Date()
  const expiresAt = parsed.data.expiresAt ?? null
  if (expiresAt !== null) {
    const expiry = Date.parse(expiresAt)
    const maximumExpiry = now.getTime() + 366 * 24 * 60 * 60 * 1_000
    if (!Number.isFinite(expiry) || expiry <= now.getTime()) {
      throw badRequest('API token expiry must be in the future')
    }
    if (expiry > maximumExpiry) {
      throw badRequest('API tokens can be valid for at most one year')
    }
  }

  const credential = createApiTokenSecret()
  const id = createId()
  const createdAt = now.toISOString()
  await db.insert(schema.apiToken).values({
    id,
    userId: principal.userId,
    name: parsed.data.name,
    tokenHash: credential.hash,
    prefix: credential.prefix,
    scopes: parsed.data.scopes,
    createdAt,
    expiresAt,
  })

  return apiData(
    CreatedApiTokenDto.parse({
      secret: credential.secret,
      token: {
        id,
        name: parsed.data.name,
        prefix: credential.prefix,
        scopes: parsed.data.scopes,
        createdAt,
        expiresAt,
        lastUsedAt: null,
        revokedAt: null,
      },
    }),
    {
      status: 201,
      headers: { 'Cache-Control': 'private, no-store', Vary: 'Cookie' },
    },
  )
})
