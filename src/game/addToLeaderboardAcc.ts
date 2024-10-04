import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { and, eq } from 'drizzle-orm'
import { maxBy, meanBy } from 'lodash-es'
import { LEADERBOARD_TYPE, LEADERBOARD_TYPE_ACC } from './config'

export const addToLeaderboardAcc = async ({ gameId }: { gameId: string }) => {
  const entries = await db.query.leaderboardEntry.findMany({
    where: and(
      eq(schema.leaderboardEntry.gameId, gameId),
      eq(schema.leaderboardEntry.type, LEADERBOARD_TYPE),
    ),
    with: {
      loadout: true,
    },
  })

  const latestEntry = maxBy(entries, (e) => e.roundNo ?? -1)
  if (!latestEntry) {
    return
  }

  const score = meanBy(entries, (e) => e.score)

  const entry = await db.query.leaderboardEntry.findFirst({
    where: and(
      eq(schema.leaderboardEntry.gameId, gameId),
      eq(schema.leaderboardEntry.type, LEADERBOARD_TYPE_ACC),
    ),
  })
  if (entry) {
    await db
      .update(schema.leaderboardEntry)
      .set({
        score,
        loadoutId: latestEntry.loadoutId,
        roundNo: latestEntry.roundNo,
      })
      .where(eq(schema.leaderboardEntry.id, entry.id))
  } else {
    await db.insert(schema.leaderboardEntry).values({
      gameId,
      score,
      type: LEADERBOARD_TYPE_ACC,
      userId: latestEntry.userId,
      loadoutId: latestEntry.loadoutId,
      roundNo: latestEntry.roundNo,
    })
  }
}
