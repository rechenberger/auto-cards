import { createHmac, timingSafeEqual } from 'node:crypto'
import { z } from 'zod'

const TOKEN_TTL_MS = 60_000

const ImpersonationTokenPayload = z.object({
  purpose: z.literal('impersonate'),
  targetUserId: z.string().min(1),
  issuedByUserId: z.string().min(1),
  expiresAt: z.number().int().positive(),
})

const getSecret = () => {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('AUTH_SECRET is required')
  return secret
}

const sign = (payload: string) =>
  createHmac('sha256', getSecret()).update(payload).digest('base64url')

export const createImpersonationToken = ({
  targetUserId,
  issuedByUserId,
}: {
  targetUserId: string
  issuedByUserId: string
}) => {
  const expiresAt = Date.now() + TOKEN_TTL_MS
  const payload = Buffer.from(
    JSON.stringify({
      purpose: 'impersonate',
      targetUserId,
      issuedByUserId,
      expiresAt,
    }),
  ).toString('base64url')
  return {
    token: `${payload}.${sign(payload)}`,
    expiresAt: new Date(expiresAt),
  }
}

export const verifyImpersonationToken = (token: string) => {
  const [payload, signature, ...rest] = token.split('.')
  if (!payload || !signature || rest.length) return null

  const expected = Buffer.from(sign(payload))
  const received = Buffer.from(signature)
  if (
    expected.length !== received.length ||
    !timingSafeEqual(expected, received)
  ) {
    return null
  }

  try {
    const parsed = ImpersonationTokenPayload.safeParse(
      JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')),
    )
    if (!parsed.success || parsed.data.expiresAt < Date.now()) return null
    return parsed.data
  } catch {
    return null
  }
}
