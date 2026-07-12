import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { Loadout } from '@/db/schema-zod'
import { addToLeaderboard } from '@/game/addToLeaderboard'
import { GAME_VERSION, LEADERBOARD_TYPE, NO_OF_ROUNDS } from '@/game/config'
import { eq } from 'drizzle-orm'
import { getLeaderboard } from '@/game/getLeaderboard'
import { enqueueJob } from './queue'

export const LEADERBOARD_SCORE_JOB = 'leaderboard.score-loadout'

export const enqueueLeaderboardScore = async ({
  loadoutId,
  reason = 'created',
}: {
  loadoutId: string
  reason?: string
}) =>
  enqueueJob({
    type: LEADERBOARD_SCORE_JOB,
    payload: { loadoutId },
    idempotencyKey: [
      LEADERBOARD_SCORE_JOB,
      GAME_VERSION,
      LEADERBOARD_TYPE,
      loadoutId,
      reason,
    ].join(':'),
  })

export const enqueueLeaderboardRefresh = async ({
  runId,
}: {
  runId: string
}) => {
  const loadoutIds = new Set<string>()
  for (let roundNo = 0; roundNo < NO_OF_ROUNDS; roundNo++) {
    const entries = await getLeaderboard({ roundNo })
    entries.forEach((entry) => loadoutIds.add(entry.loadoutId))
  }
  await Promise.all(
    [...loadoutIds].map((loadoutId) =>
      enqueueLeaderboardScore({ loadoutId, reason: `refresh:${runId}` }),
    ),
  )
  return { queued: loadoutIds.size, rounds: NO_OF_ROUNDS }
}

export const processLeaderboardJob = async (
  payload: Record<string, unknown>,
) => {
  const loadoutId = payload.loadoutId
  if (typeof loadoutId !== 'string') throw new Error('Missing loadoutId')
  const row = await db.query.loadout.findFirst({
    where: eq(schema.loadout.id, loadoutId),
  })
  if (!row) return
  const loadout = Loadout.parse(row)
  if (!loadout.userId || loadout.version !== GAME_VERSION) return
  await addToLeaderboard({ loadout, skipRevalidate: true })
}
