import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { LiveMatchParticipationData } from '@/db/schema-zod'
import { typedParse } from '@/lib/typedParse'
import assert from 'assert'
import { eq } from 'drizzle-orm'
import { cloneDeep, first, range } from 'lodash-es'
import { generateMatch } from './generateMatch'
import { rngItem, rngOrder, seedToString } from './seed'
import { enqueueLeaderboardScore } from '@/server/jobs/leaderboardJobs'
import { getAllItems } from './allItems'
import { invalidCommand } from '@/server/api/ApiError'

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
  if (!liveMatch) throw invalidCommand('Live match not found')
  if (liveMatch.liveMatchParticipations.length < 2) {
    throw invalidCommand('At least two players are required')
  }
  if (liveMatch.liveMatchParticipations.length !== liveMatch.games.length) {
    throw invalidCommand('Every player must start their game first')
  }
  if (
    !liveMatch.liveMatchParticipations.every(
      (participation) => participation.data.ready,
    )
  ) {
    throw invalidCommand('Every player must be ready')
  }
  const roundNo = first(liveMatch.games)?.data.roundNo
  if (typeof roundNo !== 'number') {
    throw invalidCommand('Round number not found')
  }
  if (!liveMatch.games.every((game) => game.data.roundNo === roundNo)) {
    throw invalidCommand('All players must be in the same round')
  }
  const rulesetVersion = first(liveMatch.games)?.version
  if (typeof rulesetVersion !== 'number') {
    throw invalidCommand('Ruleset version not found')
  }
  if (!liveMatch.games.every((game) => game.version === rulesetVersion)) {
    throw invalidCommand('All games must use the same ruleset version')
  }

  // Determine every matchup and winner before opening the write transaction.
  // Only the compact seed is persisted; clients regenerate the same report.
  const seedLiveMatch = [liveMatch.data.seed, 'fightLiveMatch', roundNo]
  const games = rngOrder({
    seed: [seedLiveMatch, 'gameOrder'],
    items: liveMatch.games,
  })
  const matchPlans = range(Math.ceil(games.length / 2)).map((matchIdx) => {
    const seed = seedToString({ seed: [seedLiveMatch, 'match', matchIdx] })
    const blue = games[matchIdx * 2]
    let red = games[matchIdx * 2 + 1]
    const redIsReal = Boolean(red)
    if (!red) {
      red = rngItem({
        seed: [seed, 'red'],
        items: games.filter((game) => game.id !== blue.id),
      })
    }
    assert(red, 'No random red found')
    const report = generateMatch({
      participants: [
        { loadout: cloneDeep(blue.data.currentLoadout) },
        { loadout: cloneDeep(red.data.currentLoadout) },
      ],
      seed: [seed],
      skipLogs: true,
      allItems: getAllItems(rulesetVersion),
      rulesetVersion,
    })
    return { blue, red, redIsReal, seed, winnerSideIdx: report.winner.sideIdx }
  })

  // Persisting a live round is one atomic unit. Together with the unique
  // (gameId, roundNo) index this also turns concurrent host clicks into one
  // committed round instead of partial or duplicate matches.
  const gamesAndLoadouts = await db.transaction(async (tx) => {
    // Acquire the lobby row before checking the snapshot. Join uses a matching
    // open-state claim, so either the join commits first and is observed here,
    // or this transition closes the lobby before that join can insert.
    const lockedMatch = await tx
      .update(schema.liveMatch)
      .set({ status: 'locked' })
      .where(eq(schema.liveMatch.id, liveMatchId))
      .returning({ id: schema.liveMatch.id })
      .then(first)
    if (!lockedMatch) throw invalidCommand('Live match not found')

    const currentParticipations = await tx
      .select()
      .from(schema.liveMatchParticipation)
      .where(eq(schema.liveMatchParticipation.liveMatchId, liveMatchId))
    const currentGames = await tx
      .select()
      .from(schema.game)
      .where(eq(schema.game.liveMatchId, liveMatchId))
    const expectedParticipationIds = new Set(
      liveMatch.liveMatchParticipations.map((entry) => entry.id),
    )
    const expectedGames = new Map(
      liveMatch.games.map((game) => [game.id, game]),
    )
    const snapshotStillCurrent =
      currentParticipations.length === expectedParticipationIds.size &&
      currentParticipations.every(
        (participation) =>
          expectedParticipationIds.has(participation.id) &&
          participation.data.ready &&
          currentGames.some(
            (game) =>
              game.userId === participation.userId &&
              participation.data.readyRevision === game.revision,
          ),
      ) &&
      currentGames.length === expectedGames.size &&
      currentGames.every((game) => {
        const expected = expectedGames.get(game.id)
        return (
          expected?.revision === game.revision &&
          expected.data.roundNo === game.data.roundNo &&
          expected.version === game.version
        )
      })
    if (!snapshotStillCurrent) {
      throw invalidCommand(
        'The live match changed while the round was starting; try again',
      )
    }

    const saved = []
    for (const game of games) {
      const loadout = await tx
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
      assert(loadout, 'No loadout found after saving')
      saved.push({ game, loadout })
    }

    const loadoutByGameId = new Map(
      saved.map(({ game, loadout }) => [game.id, loadout]),
    )
    for (const plan of matchPlans) {
      const match = await tx
        .insert(schema.match)
        .values({
          data: { seed: plan.seed },
          liveMatchId,
          gameMode: plan.blue.gameMode,
        })
        .returning()
        .then(first)
      assert(match, 'No match found after saving')

      for (const [sideIdx, game] of [plan.blue, plan.red].entries()) {
        const loadout = loadoutByGameId.get(game.id)
        assert(loadout, 'No saved loadout for live match side')
        const participation = await tx
          .insert(schema.matchParticipation)
          .values({
            data: {},
            matchId: match.id,
            loadoutId: loadout.id,
            sideIdx,
            status: plan.winnerSideIdx === sideIdx ? 'won' : 'lost',
            userId: game.userId,
          })
          .returning()
          .then(first)
        assert(participation, 'No match participation found after saving')

        if (sideIdx === 0 || plan.redIsReal) {
          const updated = await tx
            .update(schema.loadout)
            .set({ primaryMatchParticipationId: participation.id })
            .where(eq(schema.loadout.id, loadout.id))
            .returning({ id: schema.loadout.id })
          assert(updated.length === 1, 'No loadout found after updating')
        }
      }
    }

    for (const participation of liveMatch.liveMatchParticipations) {
      await tx
        .update(schema.liveMatchParticipation)
        .set({
          data: typedParse(LiveMatchParticipationData, {
            ...participation.data,
            ready: false,
            readyRevision: undefined,
          }),
        })
        .where(eq(schema.liveMatchParticipation.id, participation.id))
    }
    return saved
  })

  await Promise.all(
    gamesAndLoadouts.map(async ({ loadout, game }) => {
      if (game.gameMode === 'shopper') {
        await enqueueLeaderboardScore({ loadoutId: loadout.id })
      }
    }),
  )
}
