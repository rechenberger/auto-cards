import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { Job } from '@/db/schema-zod'
import { and, asc, eq, gte, inArray, lt, lte } from 'drizzle-orm'
import { first } from 'lodash-es'

type EnqueueJobInput = {
  type: string
  payload: Record<string, unknown>
  idempotencyKey: string
  availableAt?: Date
}

export const enqueueJob = async ({
  type,
  payload,
  idempotencyKey,
  availableAt = new Date(),
}: EnqueueJobInput) => {
  const existing = await db.query.job.findFirst({
    where: eq(schema.job.idempotencyKey, idempotencyKey),
  })
  if (existing) return Job.parse(existing)

  try {
    const inserted = await db
      .insert(schema.job)
      .values({
        type,
        payload,
        idempotencyKey,
        availableAt: availableAt.toISOString(),
      })
      .returning()
      .then(first)
    if (!inserted) throw new Error('Job was not inserted')
    return Job.parse(inserted)
  } catch (error) {
    const raced = await db.query.job.findFirst({
      where: eq(schema.job.idempotencyKey, idempotencyKey),
    })
    if (raced) return Job.parse(raced)
    throw error
  }
}

/**
 * Bulk enqueue for fan-out commands such as an item × theme image matrix.
 * Small chunks stay below SQLite bind limits; the unique key makes races safe.
 */
export const enqueueJobs = async (inputs: EnqueueJobInput[]) => {
  if (!inputs.length) return []
  const uniqueInputs = [
    ...new Map(inputs.map((input) => [input.idempotencyKey, input])).values(),
  ]

  for (let offset = 0; offset < uniqueInputs.length; offset += 50) {
    const chunk = uniqueInputs.slice(offset, offset + 50)
    await db
      .insert(schema.job)
      .values(
        chunk.map((input) => ({
          type: input.type,
          payload: input.payload,
          idempotencyKey: input.idempotencyKey,
          availableAt: (input.availableAt ?? new Date()).toISOString(),
        })),
      )
      .onConflictDoNothing({ target: schema.job.idempotencyKey })
  }

  const byKey = new Map<string, Job>()
  const keys = uniqueInputs.map((input) => input.idempotencyKey)
  for (let offset = 0; offset < keys.length; offset += 100) {
    const rows = await db.query.job.findMany({
      where: inArray(
        schema.job.idempotencyKey,
        keys.slice(offset, offset + 100),
      ),
    })
    rows.forEach((row) => {
      const job = Job.parse(row)
      byKey.set(job.idempotencyKey, job)
    })
  }

  return uniqueInputs.map((input) => {
    const job = byKey.get(input.idempotencyKey)
    if (!job) throw new Error('Bulk-enqueued job could not be loaded')
    return job
  })
}

export const claimNextJob = async () => {
  const now = new Date().toISOString()
  const candidate = await db.query.job.findFirst({
    where: and(
      eq(schema.job.status, 'queued'),
      lte(schema.job.availableAt, now),
    ),
    orderBy: asc(schema.job.availableAt),
  })
  if (!candidate) return null

  const claimed = await db
    .update(schema.job)
    .set({
      status: 'running',
      attempts: candidate.attempts + 1,
      startedAt: now,
      updatedAt: now,
    })
    .where(
      and(eq(schema.job.id, candidate.id), eq(schema.job.status, 'queued')),
    )
    .returning()
    .then(first)
  return claimed ? Job.parse(claimed) : null
}

/**
 * A serverless invocation can stop after claiming a row. Expired leases are
 * returned to the queue so they cannot remain in `running` forever.
 */
export const recoverStaleJobs = async ({
  leaseMs = 2 * 60_000,
  maxAttempts = 3,
}: {
  leaseMs?: number
  maxAttempts?: number
} = {}) => {
  const now = new Date()
  const nowIso = now.toISOString()
  const staleBefore = new Date(now.getTime() - leaseMs).toISOString()

  const failed = await db
    .update(schema.job)
    .set({
      status: 'failed',
      completedAt: nowIso,
      updatedAt: nowIso,
      error: 'Worker lease expired too many times',
    })
    .where(
      and(
        eq(schema.job.status, 'running'),
        lte(schema.job.startedAt, staleBefore),
        gte(schema.job.attempts, maxAttempts),
      ),
    )
    .returning({ id: schema.job.id })

  const requeued = await db
    .update(schema.job)
    .set({
      status: 'queued',
      availableAt: nowIso,
      startedAt: null,
      updatedAt: nowIso,
      error: 'Previous worker lease expired; retrying',
    })
    .where(
      and(
        eq(schema.job.status, 'running'),
        lte(schema.job.startedAt, staleBefore),
        lt(schema.job.attempts, maxAttempts),
      ),
    )
    .returning({ id: schema.job.id })

  return { requeued: requeued.length, failed: failed.length }
}

export const cleanupExpiredQueueState = async () => {
  const now = new Date()
  const completedBefore = new Date(
    now.getTime() - 30 * 24 * 60 * 60_000,
  ).toISOString()
  const [receipts, jobs] = await Promise.all([
    db
      .delete(schema.apiIdempotency)
      .where(lte(schema.apiIdempotency.expiresAt, now.toISOString()))
      .returning({ key: schema.apiIdempotency.key }),
    db
      .delete(schema.job)
      .where(
        and(
          eq(schema.job.status, 'completed'),
          lte(schema.job.completedAt, completedBefore),
        ),
      )
      .returning({ id: schema.job.id }),
  ])
  return { receipts: receipts.length, jobs: jobs.length }
}

const runningLease = (job: Job) => {
  if (!job.startedAt) throw new Error('Claimed job has no lease timestamp')
  return and(
    eq(schema.job.id, job.id),
    eq(schema.job.status, 'running'),
    eq(schema.job.attempts, job.attempts),
    eq(schema.job.startedAt, job.startedAt),
  )
}

export const completeJob = async (job: Job) => {
  const now = new Date().toISOString()
  const completed = await db
    .update(schema.job)
    .set({ status: 'completed', completedAt: now, updatedAt: now, error: null })
    .where(runningLease(job))
    .returning({ id: schema.job.id })
  return completed.length === 1
}

export const failJob = async ({
  job,
  error,
  maxAttempts = 3,
}: {
  job: Job
  error: unknown
  maxAttempts?: number
}) => {
  const now = new Date()
  const canRetry = job.attempts < maxAttempts
  const retryAt = new Date(now.getTime() + 2 ** job.attempts * 5_000)
  const failed = await db
    .update(schema.job)
    .set({
      status: canRetry ? 'queued' : 'failed',
      availableAt: canRetry ? retryAt.toISOString() : job.availableAt,
      updatedAt: now.toISOString(),
      completedAt: canRetry ? null : now.toISOString(),
      error: error instanceof Error ? error.message : String(error),
    })
    .where(runningLease(job))
    .returning({ id: schema.job.id })
  return failed.length === 1
}
