import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import type { ApiPrincipal } from '@/server/auth/apiPrincipal'
import { createHash } from 'node:crypto'
import { and, eq, lte } from 'drizzle-orm'
import { badRequest, conflict } from './ApiError'

const hashRequest = ({ scope, body }: { scope: string; body: string }) =>
  createHash('sha256').update(scope).update('\0').update(body).digest('hex')

const findReceipt = async ({
  key,
  principal,
  scope,
}: {
  key: string
  principal: ApiPrincipal
  scope: string
}) =>
  db.query.apiIdempotency.findFirst({
    where: and(
      eq(schema.apiIdempotency.key, key),
      eq(schema.apiIdempotency.userId, principal.userId),
      eq(schema.apiIdempotency.scope, scope),
    ),
  })

export const withIdempotency = async ({
  request,
  principal,
  scope,
  handler,
}: {
  request: Request
  principal: ApiPrincipal
  scope: string
  handler: (body: string) => Promise<Response>
}) => {
  const key = request.headers.get('idempotency-key')?.trim()
  if (!key) throw badRequest('Idempotency-Key header is required')
  if (key.length > 200) throw badRequest('Idempotency-Key is too long')

  const body = await request.text()
  const requestHash = hashRequest({ scope, body })
  const now = new Date().toISOString()

  // The key is globally unique, so remove an expired receipt before trying to
  // reserve it again. This also makes the documented 24-hour retention real.
  await db
    .delete(schema.apiIdempotency)
    .where(
      and(
        eq(schema.apiIdempotency.key, key),
        lte(schema.apiIdempotency.expiresAt, now),
      ),
    )

  const replay = (receipt: Awaited<ReturnType<typeof findReceipt>>) => {
    if (!receipt) return null
    if (receipt.requestHash !== requestHash) {
      throw conflict('Idempotency-Key was already used for another request')
    }
    if (receipt.statusCode === null || receipt.response === null) {
      throw conflict('A request with this Idempotency-Key is still running')
    }
    return Response.json(receipt.response, {
      status: receipt.statusCode,
      headers: { 'idempotency-replayed': 'true' },
    })
  }

  const existing = replay(await findReceipt({ key, principal, scope }))
  if (existing) return existing

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1_000).toISOString()
  try {
    await db.insert(schema.apiIdempotency).values({
      key,
      userId: principal.userId,
      scope,
      requestHash,
      expiresAt,
    })
  } catch {
    const raced = replay(await findReceipt({ key, principal, scope }))
    if (raced) return raced
    throw conflict('Could not reserve Idempotency-Key')
  }

  try {
    const response = await handler(body)
    const payload = await response.clone().json()
    await db
      .update(schema.apiIdempotency)
      .set({ response: payload, statusCode: response.status })
      .where(eq(schema.apiIdempotency.key, key))
    return response
  } catch (error) {
    await db
      .delete(schema.apiIdempotency)
      .where(eq(schema.apiIdempotency.key, key))
    throw error
  }
}
