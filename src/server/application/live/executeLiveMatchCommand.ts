import { LiveMatchCommandResponse } from '@/contracts/live-api'
import type { LiveMatchCommand } from '@/contracts/live-api'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { LiveMatch, LiveMatchParticipationData } from '@/db/schema-zod'
import { GAME_VERSION } from '@/game/config'
import { typedParse } from '@/lib/typedParse'
import { forbidden, invalidCommand, notFound } from '@/server/api/ApiError'
import type { ApiPrincipal } from '@/server/auth/apiPrincipal'
import { and, eq, inArray } from 'drizzle-orm'
import { getLiveMatchView } from './getLiveMatchView'

const getLiveMatchForCommand = async (liveMatchId: string) => {
  const liveMatch = await db.query.liveMatch.findFirst({
    where: eq(schema.liveMatch.id, liveMatchId),
    with: {
      liveMatchParticipations: true,
      games: true,
    },
  })
  if (!liveMatch) throw notFound('Live match not found')
  return liveMatch
}

const getRulesetVersion = (
  liveMatch: Awaited<ReturnType<typeof getLiveMatchForCommand>>,
) =>
  liveMatch.data.rulesetVersion ?? liveMatch.games[0]?.version ?? GAME_VERSION

export const executeLiveMatchCommand = async ({
  liveMatchId,
  command,
  principal,
}: {
  liveMatchId: string
  command: LiveMatchCommand
  principal: ApiPrincipal
}): Promise<LiveMatchCommandResponse> => {
  let liveMatch = await getLiveMatchForCommand(liveMatchId)
  let message: string | undefined
  let redirectTo: string | undefined

  const findMyParticipation = () =>
    liveMatch.liveMatchParticipations.find(
      (participation) => participation.userId === principal.userId,
    )

  switch (command.type) {
    case 'join': {
      if (findMyParticipation()) break
      if (liveMatch.status !== 'open') {
        throw invalidCommand('Live match is no longer open')
      }
      try {
        await db.transaction(async (tx) => {
          // The no-op state claim serializes this insert with the host's
          // open -> locked transition. A participant can never commit after
          // match creation has closed the lobby.
          const openMatch = await tx
            .update(schema.liveMatch)
            .set({ status: 'open' })
            .where(
              and(
                eq(schema.liveMatch.id, liveMatchId),
                eq(schema.liveMatch.status, 'open'),
              ),
            )
            .returning({ id: schema.liveMatch.id })
            .then((rows) => rows[0])
          if (!openMatch) {
            throw invalidCommand('Live match is no longer open')
          }
          await tx.insert(schema.liveMatchParticipation).values({
            liveMatchId,
            userId: principal.userId,
            data: typedParse(LiveMatchParticipationData, {}),
          })
        })
      } catch (error) {
        // A second request with another idempotency key may have won the race.
        const racedParticipation =
          await db.query.liveMatchParticipation.findFirst({
            where: and(
              eq(schema.liveMatchParticipation.liveMatchId, liveMatchId),
              eq(schema.liveMatchParticipation.userId, principal.userId),
            ),
          })
        if (!racedParticipation) throw error
      }
      message = 'Joined match'
      break
    }

    case 'start-game': {
      if (!findMyParticipation()) {
        throw forbidden('Join the live match before starting a game')
      }
      const existingGame = liveMatch.games.find(
        (game) => game.userId === principal.userId,
      )
      let game = existingGame
      if (!game) {
        try {
          const { createGame } = await import('@/game/createGame')
          game = await createGame({
            userId: principal.userId,
            liveMatch: LiveMatch.parse(liveMatch),
            gameVersion: getRulesetVersion(liveMatch),
          })
        } catch (error) {
          // The unique (liveMatchId, userId) index makes concurrent starts safe.
          game = await db.query.game.findFirst({
            where: and(
              eq(schema.game.liveMatchId, liveMatchId),
              eq(schema.game.userId, principal.userId),
            ),
          })
          if (!game) throw error
        }
      }
      redirectTo = `/game/${game.id}`
      break
    }

    case 'ready': {
      const participation = findMyParticipation()
      if (!participation) throw forbidden('You are not in this live match')
      const game = liveMatch.games.find(
        (candidate) => candidate.userId === principal.userId,
      )
      if (!game) throw invalidCommand('Start your game before readying up')
      if (game.version !== getRulesetVersion(liveMatch)) {
        throw invalidCommand('Your game uses another ruleset version')
      }
      const completedRound = await db.query.loadout.findFirst({
        columns: { id: true },
        where: and(
          eq(schema.loadout.gameId, game.id),
          eq(schema.loadout.roundNo, game.data.roundNo),
        ),
      })
      if (completedRound) {
        throw invalidCommand('Start the next round before marking ready again')
      }
      if (!participation.data.ready) {
        // Claim the current game revision before marking it ready. Any shop
        // command that started with the previous revision will now fail its
        // optimistic write instead of changing the snapshotted loadout.
        const readyAt = new Date().toISOString()
        await db.transaction(async (tx) => {
          const claimedGame = await tx
            .update(schema.game)
            .set({ revision: game.revision + 1, updatedAt: readyAt })
            .where(
              and(
                eq(schema.game.id, game.id),
                eq(schema.game.revision, game.revision),
              ),
            )
            .returning({ revision: schema.game.revision })
            .then((rows) => rows[0])
          if (!claimedGame) {
            throw invalidCommand('Your game changed while marking it ready')
          }
          await tx
            .update(schema.liveMatchParticipation)
            .set({
              data: typedParse(LiveMatchParticipationData, {
                ...participation.data,
                ready: true,
                readyRevision: claimedGame.revision,
              }),
            })
            .where(eq(schema.liveMatchParticipation.id, participation.id))
        })
      }
      message = 'Ready'
      break
    }

    case 'start-matches': {
      const participation = findMyParticipation()
      if (!participation?.data.isHost) {
        throw forbidden('Only the host can start matches')
      }
      if (liveMatch.liveMatchParticipations.length < 2) {
        throw invalidCommand('At least two players are required')
      }
      if (liveMatch.games.length !== liveMatch.liveMatchParticipations.length) {
        throw invalidCommand('Every player must start their game first')
      }
      if (
        !liveMatch.liveMatchParticipations.every(
          (candidate) => candidate.data.ready,
        )
      ) {
        throw invalidCommand('Every player must be ready')
      }

      const rulesetVersion = getRulesetVersion(liveMatch)
      if (!liveMatch.games.every((game) => game.version === rulesetVersion)) {
        throw invalidCommand('All games must use the live match ruleset')
      }
      if (
        !liveMatch.liveMatchParticipations.every((candidate) => {
          const game = liveMatch.games.find(
            (entry) => entry.userId === candidate.userId,
          )
          return game && candidate.data.readyRevision === game.revision
        })
      ) {
        throw invalidCommand(
          'A game changed after its player marked the round as ready',
        )
      }
      const roundNo = liveMatch.games[0]?.data.roundNo
      if (
        roundNo === undefined ||
        !liveMatch.games.every((game) => game.data.roundNo === roundNo)
      ) {
        throw invalidCommand('All players must be in the same round')
      }

      const gameIds = liveMatch.games.map((game) => game.id)
      const existingRoundLoadouts = await db.query.loadout.findMany({
        columns: { id: true },
        where: and(
          inArray(schema.loadout.gameId, gameIds),
          eq(schema.loadout.roundNo, roundNo),
        ),
      })
      if (existingRoundLoadouts.length > 0) {
        throw invalidCommand('This round has already been played')
      }

      const { fightLiveMatch } = await import('@/game/fightLiveMatch')
      await fightLiveMatch({ liveMatchId })
      message = 'Matches started'
      break
    }
  }

  // Commands can insert games or participations, so build from a fresh query.
  liveMatch = await getLiveMatchForCommand(liveMatchId)

  return LiveMatchCommandResponse.parse({
    view: await getLiveMatchView({ liveMatchId, principal }),
    message,
    redirectTo,
  })
}
