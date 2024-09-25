import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import {
  GAME_VERSION,
  LEADERBOARD_LIMIT,
  LEADERBOARD_TYPE,
  NO_OF_ROUNDS,
} from '@/game/config'
import { and, desc, eq } from 'drizzle-orm'
import { rankByScore } from './rankByScore'

export const getLeaderboard = async ({
  type = LEADERBOARD_TYPE,
  roundNo = NO_OF_ROUNDS - 1,
}: {
  type?: string
  roundNo?: number
}) => {
  const leaderboard = await db.query.leaderboardEntry.findMany({
    orderBy: desc(schema.leaderboardEntry.score),
    limit: LEADERBOARD_LIMIT,
    where: and(
      eq(schema.leaderboardEntry.type, type),
      eq(schema.leaderboardEntry.roundNo, roundNo),
      eq(schema.leaderboardEntry.version, GAME_VERSION),
    ),
    with: {
      user: true,
      loadout: true,
    },
  })

  return leaderboard
}

export const getLeaderboardRanked = async (options: {
  type?: string
  roundNo?: number
}) => {
  const leaderboard = await getLeaderboard(options)
  const entries = leaderboard.map((e) => ({
    ...e,
    rank: 0,
  }))
  return rankByScore({ entries })
}
