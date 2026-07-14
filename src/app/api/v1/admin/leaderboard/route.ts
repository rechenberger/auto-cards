import {
  AdminLeaderboardCommand,
  AdminLeaderboardResult,
} from '@/contracts/admin-leaderboard'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { LEADERBOARD_TYPE } from '@/game/config'
import { badRequest } from '@/server/api/ApiError'
import { withIdempotency } from '@/server/api/idempotency'
import { apiData, apiRoute, parseJson } from '@/server/api/route'
import { requireApiAdmin } from '@/server/auth/apiPrincipal'
import {
  enqueueLeaderboardRefresh,
  enqueueLeaderboardScore,
} from '@/server/jobs/leaderboardJobs'
import { eq } from 'drizzle-orm'
import { countBy, omitBy, orderBy } from 'lodash-es'
import { runDueJobs } from '@/server/jobs/runJobs'
import { after } from 'next/server'

export const POST = apiRoute(async (_context, request: Request) => {
  const principal = await requireApiAdmin({
    request,
    requiredScopes: ['admin'],
  })
  const response = await withIdempotency({
    request,
    principal,
    scope: 'admin:leaderboard',
    handler: async (body) => {
      const parsed = AdminLeaderboardCommand.safeParse(parseJson(body))
      if (!parsed.success) {
        throw badRequest('Invalid leaderboard command', parsed.error.flatten())
      }

      if (parsed.data.type === 'refresh') {
        const result = await enqueueLeaderboardRefresh({
          runId: crypto.randomUUID(),
        })
        return apiData(AdminLeaderboardResult.parse(result), { status: 202 })
      }
      if (parsed.data.type === 'score-loadout') {
        await enqueueLeaderboardScore({
          loadoutId: parsed.data.loadoutId,
          reason: `manual:${crypto.randomUUID()}`,
        })
        return apiData(AdminLeaderboardResult.parse({ queued: 1 }), {
          status: 202,
        })
      }

      const entries = await db.query.leaderboardEntry.findMany({
        where: eq(schema.leaderboardEntry.type, LEADERBOARD_TYPE),
      })
      const duplicateCounts = omitBy(
        countBy(entries, (entry) => entry.loadoutId),
        (count) => count <= 1,
      )
      let removed = 0
      for (const loadoutId of Object.keys(duplicateCounts)) {
        const [, ...duplicates] = orderBy(
          entries.filter((entry) => entry.loadoutId === loadoutId),
          (entry) => entry.score,
          'desc',
        )
        for (const duplicate of duplicates) {
          await db
            .delete(schema.leaderboardEntry)
            .where(eq(schema.leaderboardEntry.id, duplicate.id))
          removed += 1
        }
      }
      return apiData(AdminLeaderboardResult.parse({ removed }))
    },
  })
  after(() => runDueJobs({ limit: 1_000, deadline: Date.now() + 45_000 }))
  return response
})
