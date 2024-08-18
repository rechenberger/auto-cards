import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { Game } from '@/db/schema-zod'
import { and, eq, isNull } from 'drizzle-orm'
import { cloneDeep, first } from 'lodash-es'
import { generateMatch } from './generateMatch'
import { rngItem, seedToString } from './seed'

export const fight = async ({ game }: { game: Game }) => {
  const enemyLoadouts = await db.query.loadout.findMany({
    where: and(
      eq(schema.loadout.roundNo, game.data.roundNo),
      isNull(schema.loadout.userId),
    ),
    limit: 5,
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

  const matchReport = await generateMatch({
    participants: [
      {
        loadout: cloneDeep(game.data.currentLoadout),
      },
      {
        loadout: enemyLoadout.data,
      },
    ],
    seed: [seed],
  })

  const myLoadout = await db
    .insert(schema.loadout)
    .values({
      data: game.data.currentLoadout,
      roundNo: game.data.roundNo,
      userId: game.userId,
      gameId: game.id,
    })
    .returning()
    .then(first)

  if (!myLoadout) {
    throw new Error('No loadout found after saving')
  }

  const match = await db
    .insert(schema.match)
    .values({
      data: {
        seed,
      },
    })
    .returning()
    .then(first)

  if (!match) {
    throw new Error('No match found after saving')
  }

  const hasWon = matchReport.winner.sideIdx === 0

  const myParticipation = await db
    .insert(schema.matchParticipation)
    .values([
      {
        data: {},
        matchId: match.id,
        loadoutId: myLoadout.id,
        sideIdx: 0,
        status: hasWon ? 'won' : 'lost',
        userId: game.userId,
      },
      {
        data: {},
        matchId: match.id,
        loadoutId: enemyLoadout.id,
        sideIdx: 1,
        status: !hasWon ? 'won' : 'lost',
        userId: enemyLoadout.userId,
      },
    ])
    .returning()
    .then(first)

  if (!myParticipation) {
    throw new Error('No match participation found after saving')
  }

  await db
    .update(schema.loadout)
    .set({
      primaryMatchParticipationId: myParticipation.id,
    })
    .where(eq(schema.loadout.id, myLoadout.id))

  return {
    matchReport,
    hasWon,
    match,
    myParticipation,
    enemyLoadout,
  }
}
