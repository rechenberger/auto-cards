import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { Game } from '@/db/schema-zod'
import { and, desc, eq, isNull, ne, or } from 'drizzle-orm'
import { cloneDeep, first } from 'lodash-es'
import { GAME_VERSION, NO_OF_LATEST_LOADOUTS } from './config'
import { generateMatch } from './generateMatch'
import { rngItem, seedToString } from './seed'
import { enqueueLeaderboardScore } from '@/server/jobs/leaderboardJobs'
import { getAllItems } from './allItems'
import { staleRevision } from '@/server/api/ApiError'

export const fight = async ({
  game,
  expectedRevision,
}: {
  game: Game
  expectedRevision: number
}) => {
  const enemyLoadouts = await db.query.loadout.findMany({
    where: and(
      eq(schema.loadout.roundNo, game.data.roundNo),
      or(ne(schema.loadout.userId, game.userId), isNull(schema.loadout.userId)),
      eq(schema.loadout.version, GAME_VERSION),
    ),
    limit: NO_OF_LATEST_LOADOUTS,
    orderBy: desc(schema.loadout.createdAt),
  })
  const enemyLoadout = rngItem({
    items: enemyLoadouts,
    seed: [...game.data.seed, 'round', game.data.roundNo, 'enemy'],
  })
  if (!enemyLoadout) {
    throw new Error('No enemy found')
  }

  const seed = seedToString({
    seed: [...game.data.seed, game.data.roundNo, 'match'],
  })

  const matchReport = generateMatch({
    participants: [
      {
        loadout: cloneDeep(game.data.currentLoadout),
      },
      {
        loadout: enemyLoadout.data,
      },
    ],
    seed: [seed],
    skipLogs: true,
    allItems: getAllItems(game.version),
    rulesetVersion: game.version,
  })

  const hasWon = matchReport.winner.sideIdx === 0
  const { claimedGame, myLoadout, match, myParticipation } =
    await db.transaction(async (tx) => {
      // Claiming the game revision and persisting the round are one commit.
      // A competing shop command can therefore observe either the complete
      // match or the previous revision, never an in-between state.
      const claimedGame = await tx
        .update(schema.game)
        .set({
          data: game.data,
          revision: expectedRevision + 1,
          updatedAt: new Date().toISOString(),
        })
        .where(
          and(
            eq(schema.game.id, game.id),
            eq(schema.game.revision, expectedRevision),
          ),
        )
        .returning()
        .then(first)
      if (!claimedGame) throw staleRevision(expectedRevision + 1)

      const myLoadout = await tx
        .insert(schema.loadout)
        .values({
          data: game.data.currentLoadout,
          roundNo: game.data.roundNo,
          userId: game.userId,
          gameId: game.id,
          version: game.version,
          gameMode: game.gameMode,
        })
        .returning()
        .then(first)
      if (!myLoadout) throw new Error('No loadout found after saving')

      const match = await tx
        .insert(schema.match)
        .values({ data: { seed }, gameMode: game.gameMode })
        .returning()
        .then(first)
      if (!match) throw new Error('No match found after saving')

      const myParticipation = await tx
        .insert(schema.matchParticipation)
        .values({
          data: {},
          matchId: match.id,
          loadoutId: myLoadout.id,
          sideIdx: 0,
          status: hasWon ? 'won' : 'lost',
          userId: game.userId,
        })
        .returning()
        .then(first)
      if (!myParticipation) {
        throw new Error('No match participation found after saving')
      }

      await tx.insert(schema.matchParticipation).values({
        data: {},
        matchId: match.id,
        loadoutId: enemyLoadout.id,
        sideIdx: 1,
        status: !hasWon ? 'won' : 'lost',
        userId: enemyLoadout.userId,
      })
      await tx
        .update(schema.loadout)
        .set({ primaryMatchParticipationId: myParticipation.id })
        .where(eq(schema.loadout.id, myLoadout.id))

      return {
        claimedGame: Game.parse(claimedGame),
        myLoadout,
        match,
        myParticipation,
      }
    })

  if (game.gameMode === 'shopper') {
    await enqueueLeaderboardScore({ loadoutId: myLoadout.id })
  }

  return {
    matchReport,
    hasWon,
    match,
    myParticipation,
    enemyLoadout,
    game: claimedGame,
  }
}
