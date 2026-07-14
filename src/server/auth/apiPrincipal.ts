import { auth } from '@/auth/auth'
import { isDev } from '@/auth/dev'
import { db } from '@/db/db'
import { users } from '@/db/schema-auth'
import { schema } from '@/db/schema-export'
import { ApiTokenScope, ApiTokenScopes } from '@/contracts/api-token'
import { eq } from 'drizzle-orm'
import { forbidden, unauthenticated } from '../api/ApiError'
import {
  hashApiToken,
  hasRequiredApiTokenScopes,
  isApiTokenActive,
  parseBearerApiToken,
} from './apiToken'

export type ApiPrincipal = {
  userId: string
  isAdmin: boolean
  authType: 'session' | 'token'
  tokenId?: string
  scopes: 'all' | ApiTokenScope[]
}

const requireSessionPrincipal = async ({
  allowDevAdmin,
}: {
  allowDevAdmin: boolean
}): Promise<ApiPrincipal> => {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) throw unauthenticated()

  const user = await db.query.users.findFirst({
    columns: { id: true, isAdmin: true },
    where: eq(users.id, userId),
  })
  if (!user) throw unauthenticated()

  return {
    userId,
    isAdmin: Boolean(user.isAdmin || (allowDevAdmin && isDev())),
    authType: 'session',
    scopes: 'all',
  }
}

export const requireApiSession = async ({ allowDevAdmin = false } = {}) =>
  requireSessionPrincipal({ allowDevAdmin })

const requireTokenPrincipal = async ({
  secret,
  requiredScopes,
}: {
  secret: string
  requiredScopes: readonly ApiTokenScope[]
}): Promise<ApiPrincipal> => {
  const token = await db.query.apiToken.findFirst({
    where: eq(schema.apiToken.tokenHash, hashApiToken(secret)),
  })
  if (!token || !isApiTokenActive(token)) {
    throw unauthenticated('Invalid or expired API token')
  }

  const scopes = ApiTokenScopes.safeParse(token.scopes)
  if (!scopes.success) throw unauthenticated('Invalid API token')
  if (
    !hasRequiredApiTokenScopes({
      granted: scopes.data,
      required: requiredScopes,
    })
  ) {
    throw forbidden('API token is missing a required scope')
  }

  const user = await db.query.users.findFirst({
    columns: { id: true, isAdmin: true },
    where: eq(users.id, token.userId),
  })
  if (!user) throw unauthenticated('API token owner no longer exists')
  if (requiredScopes.includes('admin') && !user.isAdmin) {
    throw forbidden('Admin access required')
  }

  await db
    .update(schema.apiToken)
    .set({ lastUsedAt: new Date().toISOString() })
    .where(eq(schema.apiToken.id, token.id))

  return {
    userId: user.id,
    // A token owned by an admin is not implicitly an admin token. Elevated
    // behavior is available only when the owner is still an admin and the
    // deliberately issued token carries the admin scope.
    isAdmin: Boolean(user.isAdmin && scopes.data.includes('admin')),
    authType: 'token',
    tokenId: token.id,
    scopes: scopes.data,
  }
}

export const requireApiPrincipal = async ({
  request,
  requiredScopes = [],
  allowDevAdmin = false,
}: {
  request?: Request
  requiredScopes?: readonly ApiTokenScope[]
  allowDevAdmin?: boolean
} = {}): Promise<ApiPrincipal> => {
  const bearer = parseBearerApiToken(
    request?.headers.get('authorization') ?? null,
  )
  if (bearer === undefined)
    throw unauthenticated('Invalid Authorization header')
  if (bearer !== null)
    return requireTokenPrincipal({ secret: bearer, requiredScopes })
  return requireSessionPrincipal({ allowDevAdmin })
}

export const requireApiAdmin = async ({
  request,
  requiredScopes = ['admin'],
  allowDev = false,
}: {
  request?: Request
  requiredScopes?: readonly ApiTokenScope[]
  allowDev?: boolean
} = {}) => {
  const principal = await requireApiPrincipal({
    request,
    requiredScopes,
    allowDevAdmin: allowDev,
  })
  if (!principal.isAdmin) throw forbidden('Admin access required')
  return principal
}
