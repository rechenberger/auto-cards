import type { ApiTokenScope } from '@/contracts/api-token'
import { createHash, randomBytes } from 'node:crypto'

const TOKEN_MARKER = 'acp_'
const TOKEN_SECRET_BYTES = 32
const TOKEN_SECRET_PATTERN = /^[A-Za-z0-9_-]{43}$/
const DISPLAY_PREFIX_LENGTH = 12

export const createApiTokenSecret = () => {
  const secret = `${TOKEN_MARKER}${randomBytes(TOKEN_SECRET_BYTES).toString(
    'base64url',
  )}`
  return {
    secret,
    hash: hashApiToken(secret),
    prefix: secret.slice(0, DISPLAY_PREFIX_LENGTH),
  }
}

export const hashApiToken = (secret: string) =>
  createHash('sha256').update(secret, 'utf8').digest('hex')

export const parseBearerApiToken = (authorization: string | null) => {
  if (!authorization) return null
  const match = /^Bearer\s+(\S+)$/i.exec(authorization)
  if (!match) return undefined
  const secret = match[1]
  if (
    !secret.startsWith(TOKEN_MARKER) ||
    !TOKEN_SECRET_PATTERN.test(secret.slice(TOKEN_MARKER.length))
  ) {
    return undefined
  }
  return secret
}

export const hasRequiredApiTokenScopes = ({
  granted,
  required,
}: {
  granted: readonly ApiTokenScope[]
  required: readonly ApiTokenScope[]
}) => {
  const grantedSet = new Set(granted)
  return required.every((scope) => grantedSet.has(scope))
}

export const isApiTokenActive = (
  token: { revokedAt: string | null; expiresAt: string | null },
  now = new Date(),
) => {
  if (token.revokedAt !== null) return false
  if (token.expiresAt === null) return true
  const expiresAt = Date.parse(token.expiresAt)
  return Number.isFinite(expiresAt) && expiresAt > now.getTime()
}
