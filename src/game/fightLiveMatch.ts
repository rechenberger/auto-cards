import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import assert from 'assert'
import { eq } from 'drizzle-orm'
import { cloneDeep, first, range } from 'lodash-es'
import { generateMatch } from './generateMatch'
import { rngItem, rngOrder, seedToString } from './seed'

export const fightLiveMatch = async ({
  liveMatchId,
}: {
  liveMatchId: string
}) => {
  const liveMatch = await db.query.liveMatch.findFirst({
    where: eq(schema.liveMatch.id, liveMatchId),
    with: {
      liveMatchParticipations: true,
      games: true,
    },
  })

  // SANITY CHECKS
  assert(liveMatch, 'Live match not found')
  assert(liveMatch.liveMatchParticipations.length > 1, 'Not enough players')
  assert(
    liveMatch.liveMatchParticipations.length === liveMatch.games.length,
    'Live match participations and games mismatch',
  )
  assert(
    liveMatch.liveMatchParticipations.every(
      (participation) => participation.data.ready,
    ),
    'All players must be ready',
  )
  const roundNo = first(liveMatch.games)?.data.roundNo
  assert(typeof roundNo === 'number', 'Round number not found')
  assert(
    liveMatch.games.every((game) => game.data.roundNo === roundNo),
    'All games must have the same round number',
  )

  // DETERMINE MATCHUP

  const seedLiveMatch = [liveMatch.data.seed, 'fightLiveMatch', roundNo]

  const games = rngOrder({
    seed: [seedLiveMatch, 'gameOrder'],
    items: liveMatch.games,
  })

  const gamesAndLoadouts = await Promise.all(
    games.map(async (game) => {
      const loadout = await db
        .insert(schema.loadout)
        .values({
          data: game.data.currentLoadout,
          roundNo: game.data.roundNo,
          userId: game.userId,
          gameId: game.id,
        })
        .returning()
        .then(first)

      assert(loadout, 'No loadout found after saving')
      return { game, loadout }
    }),
  )

  for (const matchIdx of range(Math.ceil(gamesAndLoadouts.length / 2))) {
    const seedMatch = seedToString({
      seed: [seedLiveMatch, 'match', matchIdx],
    })

    const blue = gamesAndLoadouts[matchIdx * 2]
    let red = gamesAndLoadouts[matchIdx * 2 + 1]
    const redIsReal = !!red
    if (!red) {
      red = rngItem({
        seed: [seedMatch, 'red'],
        items: gamesAndLoadouts.filter((g) => g.game.id !== blue.game.id),
      })
      assert(red, 'No random red found')
    }

    const matchReport = await generateMatch({
      participants: [
        {
          loadout: cloneDeep(blue.loadout.data),
        },
        {
          loadout: cloneDeep(red.loadout.data),
        },
      ],
      seed: [seedMatch],
    })

    const sides = [blue, red].map((side, sideIdx) => {
      return { ...side, sideIdx }
    })

    const match = await db
      .insert(schema.match)
      .values({
        data: {
          seed: seedMatch,
        },
      })
      .returning()
      .then(first)

    assert(match, 'No match found after saving')

    await Promise.all(
      sides.map(async (side) => {
        const hasWon = matchReport.winner.sideIdx === side.sideIdx
        const matchParticipation = await db
          .insert(schema.matchParticipation)
          .values([
            {
              data: {},
              matchId: match.id,
              loadoutId: side.loadout.id,
              sideIdx: 0,
              status: hasWon ? 'won' : 'lost',
              userId: side.game.userId,
            },
          ])
          .returning()
          .then(first)

        assert(matchParticipation, 'No matchParticipation found after saving')

        const isPrimary = side.sideIdx === 0 || redIsReal
        if (isPrimary) {
          const loadout = await db
            .update(schema.loadout)
            .set({
              primaryMatchParticipationId: matchParticipation.id,
            })
            .where(eq(schema.loadout.id, side.loadout.id))
            .returning()
          assert(loadout, 'No loadout found after updating')
        }
      }),
    )
  }
}
