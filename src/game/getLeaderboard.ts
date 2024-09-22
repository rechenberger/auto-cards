import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import {
  LEADERBOARD_LIMIT,
  LEADERBOARD_TYPE,
  NO_OF_ROUNDS,
} from '@/game/config'
import { and, desc, eq } from 'drizzle-orm'

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
    ),
    with: {
      user: true,
      loadout: true,
    },
  })

  return leaderboard
}
