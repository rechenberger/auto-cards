import { enqueueLeaderboardRefresh } from '@/server/jobs/leaderboardJobs'
import { runDueJobs } from '@/server/jobs/runJobs'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export const GET = async (request: Request) => {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  // One logical run per UTC day. Duplicate cron delivery therefore remains a
  // no-op at the queue's idempotency boundary.
  const runId = new Date().toISOString().slice(0, 10)
  const queued = await enqueueLeaderboardRefresh({ runId })
  const processed = await runDueJobs({
    limit: 1_000,
    deadline: Date.now() + 55_000,
  })
  return Response.json({ runId, ...queued, ...processed })
}
