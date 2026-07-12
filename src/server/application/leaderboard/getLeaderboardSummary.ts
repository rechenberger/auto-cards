import type { LeaderboardSummaryDto } from '@/contracts/watch'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import type { Loadout } from '@/db/schema-zod'
import {
  GAME_VERSION,
  LEADERBOARD_LIMIT,
  LEADERBOARD_TYPE_ACC,
} from '@/game/config'
import { rankByScore } from '@/game/rankByScore'
import { and, desc, eq, inArray } from 'drizzle-orm'

type SummaryLoadout = Pick<Loadout, 'id' | 'roundNo' | 'version'>

/**
 * Resolve leaderboard summaries in a bounded number of queries. The public
 * leaderboard only ranks the active ruleset. Historical scores belong to a
 * previous season and must not leak through summaries on games or live-match
 * results.
 */
export const getLeaderboardSummaries = async ({
  loadouts,
}: {
  loadouts: SummaryLoadout[]
}): Promise<Map<string, LeaderboardSummaryDto>> => {
  const uniqueLoadouts = [
    ...new Map(loadouts.map((loadout) => [loadout.id, loadout])).values(),
  ].filter((loadout) => loadout.version === GAME_VERSION)
  if (uniqueLoadouts.length === 0) return new Map()

  const summaries = new Map<string, LeaderboardSummaryDto>()
  const requestedLoadoutIds = new Set(
    uniqueLoadouts.map((loadout) => loadout.id),
  )
  const activeRounds = [
    ...new Set(uniqueLoadouts.map((loadout) => loadout.roundNo)),
  ]

  await Promise.all(
    activeRounds.map(async (roundNo) => {
      const entries = await db
        .select({
          loadoutId: schema.leaderboardEntry.loadoutId,
          score: schema.leaderboardEntry.score,
        })
        .from(schema.leaderboardEntry)
        .where(
          and(
            eq(schema.leaderboardEntry.type, LEADERBOARD_TYPE_ACC),
            eq(schema.leaderboardEntry.roundNo, roundNo),
            eq(schema.leaderboardEntry.version, GAME_VERSION),
          ),
        )
        .orderBy(desc(schema.leaderboardEntry.score))
        .limit(LEADERBOARD_LIMIT)

      for (const entry of rankByScore({
        entries: entries.map((entry) => ({ ...entry, rank: 0 })),
      })) {
        if (
          requestedLoadoutIds.has(entry.loadoutId) &&
          !summaries.has(entry.loadoutId)
        ) {
          summaries.set(entry.loadoutId, {
            rank: entry.rank,
            score: entry.score,
            isTop: true,
          })
        }
      }
    }),
  )

  const unresolved = uniqueLoadouts.filter(
    (loadout) => !summaries.has(loadout.id),
  )
  if (unresolved.length === 0) return summaries

  const storedEntries = await db
    .select({
      loadoutId: schema.leaderboardEntry.loadoutId,
      roundNo: schema.leaderboardEntry.roundNo,
      version: schema.leaderboardEntry.version,
      score: schema.leaderboardEntry.score,
    })
    .from(schema.leaderboardEntry)
    .where(
      and(
        eq(schema.leaderboardEntry.type, LEADERBOARD_TYPE_ACC),
        eq(schema.leaderboardEntry.version, GAME_VERSION),
        inArray(
          schema.leaderboardEntry.loadoutId,
          unresolved.map((loadout) => loadout.id),
        ),
      ),
    )
    .orderBy(desc(schema.leaderboardEntry.score))

  for (const loadout of unresolved) {
    const entry = storedEntries.find(
      (candidate) =>
        candidate.loadoutId === loadout.id &&
        candidate.roundNo === loadout.roundNo &&
        candidate.version === GAME_VERSION,
    )
    if (entry) {
      summaries.set(loadout.id, {
        rank: 99,
        score: entry.score,
        isTop: false,
      })
    }
  }

  return summaries
}

export const getLeaderboardSummary = async ({
  loadout,
}: {
  loadout: SummaryLoadout
}): Promise<LeaderboardSummaryDto | null> => {
  const summaries = await getLeaderboardSummaries({ loadouts: [loadout] })
  return summaries.get(loadout.id) ?? null
}
