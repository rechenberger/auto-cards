import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { and, eq } from 'drizzle-orm'
import { maxBy, sumBy } from 'lodash-es'
import { GAME_VERSION, LEADERBOARD_TYPE, LEADERBOARD_TYPE_ACC } from './config'

export const addToLeaderboardAcc = async ({
  gameId,
  roundNo,
  dryRun,
}: {
  gameId: string
  roundNo: number
  dryRun?: boolean
}) => {
  let leaderboard = await db.query.leaderboardEntry.findMany({
    where: and(
      eq(schema.leaderboardEntry.type, LEADERBOARD_TYPE),
      eq(schema.leaderboardEntry.version, GAME_VERSION),
      eq(schema.leaderboardEntry.gameId, gameId),
    ),
    with: {
      loadout: true,
    },
  })

  leaderboard = leaderboard.filter(
    (e) => e.roundNo !== null && e.roundNo <= roundNo,
  )

  const entriesRelative = leaderboard.map((e) => {
    const weightRelative = (e.roundNo + 1) / (roundNo + 1)

    return {
      ...e,
      weightRelative,
      pointsRelative: e.score * weightRelative,
    }
  })

  const totalWeight = sumBy(entriesRelative, (e) => e.weightRelative)

  const entries = entriesRelative.map((e) => ({
    ...e,
    weightAbsolute: e.weightRelative / totalWeight,
    pointsAbsolute: e.pointsRelative / totalWeight,
  }))

  if (entries.length !== roundNo + 1) {
    return
  }

  const latestEntry = maxBy(entries, (e) => e.roundNo)
  if (!latestEntry) {
    return
  }

  const score = sumBy(entries, (e) => e.pointsAbsolute)

  if (!dryRun) {
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

  return {
    score,
    entries,
  }
}
