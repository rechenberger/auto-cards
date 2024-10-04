import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { Loadout } from '@/db/schema-zod'
import { and, eq } from 'drizzle-orm'
import { addToLeaderboardAcc } from './addToLeaderboardAcc'
import { LEADERBOARD_TYPE } from './config'
import { getLeaderboard } from './getLeaderboard'
import { generateMatchByWorker } from './matchWorkerManager'
import { revalidateLeaderboard } from './revalidateLeaderboard'
import { seedToString } from './seed'

export const addToLeaderboard = async ({
  loadout,
  type = LEADERBOARD_TYPE,
  roundNo = loadout.roundNo,
  dryRun,
}: {
  loadout: Loadout
  type?: string
  roundNo?: number
  dryRun?: boolean
}) => {
  let leaderboard = await getLeaderboard({
    roundNo,
    type,
  })
  if (!loadout.userId) {
    return
  }

  const selfLeaderboardEntry = await db.query.leaderboardEntry.findFirst({
    where: and(
      eq(schema.leaderboardEntry.loadoutId, loadout.id),
      eq(schema.leaderboardEntry.type, type),
      eq(schema.leaderboardEntry.roundNo, roundNo),
    ),
  })

  if (selfLeaderboardEntry) {
    leaderboard = leaderboard.filter(
      (entry) => entry.id !== selfLeaderboardEntry.id,
    )
  }

  const resultsSettled = await Promise.allSettled(
    leaderboard.map(async (entry, idx) => {
      const seed = seedToString({
        seed: ['addToLeaderboard', type, roundNo, loadout.id, entry.id],
      })
      const result = await generateMatchByWorker({
        participants: [
          {
            loadout: loadout.data,
          },
          {
            loadout: entry.loadout.data,
          },
        ],
        seed: [seed],
        skipLogs: true,
      })

      const win = result.winner.sideIdx === 0

      let rank = idx + 1

      if (
        selfLeaderboardEntry?.score &&
        selfLeaderboardEntry.score > entry.score
      ) {
        rank += 1
      }

      return {
        win,
        entry,
        seed,
        rank,
      }
    }),
  )

  // Only use the results that were fulfilled
  const results = resultsSettled.flatMap((result) =>
    result.status === 'fulfilled' ? result.value : [],
  )

  if (results.length < leaderboard.length) {
    console.warn(
      'Some matches failed while adding to leaderboard',
      resultsSettled.filter((result) => result.status === 'rejected'),
    )
  }

  const matchCount = results.length || 1
  const winCount = results.filter((result) => result.win).length
  const winRate = winCount / matchCount
  let score = winRate * 100

  score = Math.round(score * 100) / 100

  if (!dryRun) {
    if (selfLeaderboardEntry) {
      await db
        .update(schema.leaderboardEntry)
        .set({
          score,
        })
        .where(eq(schema.leaderboardEntry.id, selfLeaderboardEntry.id))
    } else {
      await db.insert(schema.leaderboardEntry).values({
        loadoutId: loadout.id,
        type,
        roundNo,
        score,
        userId: loadout.userId,
        gameId: loadout.gameId,
      })
    }
  }

  if (loadout.gameId) {
    await addToLeaderboardAcc({ gameId: loadout.gameId })
  }

  revalidateLeaderboard()

  return {
    results,
    score,
  }
}
