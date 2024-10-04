import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { and, eq } from 'drizzle-orm'
import { maxBy, meanBy } from 'lodash-es'
import { LEADERBOARD_TYPE, LEADERBOARD_TYPE_ACC } from './config'

export const addToLeaderboardAcc = async ({
  gameId,
  roundNo,
}: {
  gameId: string
  roundNo: number
}) => {
  let entries = await db.query.leaderboardEntry.findMany({
    where: and(
      eq(schema.leaderboardEntry.gameId, gameId),
      eq(schema.leaderboardEntry.type, LEADERBOARD_TYPE),
    ),
    with: {
      loadout: true,
    },
  })

  entries = entries.filter((e) => e.roundNo !== null && e.roundNo <= roundNo)
  if (entries.length !== roundNo + 1) {
    return
  }

  const latestEntry = maxBy(entries, (e) => e.roundNo ?? -1)
  if (!latestEntry) {
    return
  }

  const score = meanBy(entries, (e) => e.score)

  const entry = await db.query.leaderboardEntry.findFirst({
    where: and(
      eq(schema.leaderboardEntry.gameId, gameId),
      eq(schema.leaderboardEntry.type, LEADERBOARD_TYPE_ACC),
      eq(schema.leaderboardEntry.roundNo, roundNo),
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
