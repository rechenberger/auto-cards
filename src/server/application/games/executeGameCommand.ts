import { GameCommandRequest, GameCommandResponse } from '@/contracts/game-api'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { Game } from '@/db/schema-zod'
import { GAME_VERSION } from '@/game/config'
import { fight } from '@/game/fight'
import { invalidCommand, staleRevision } from '@/server/api/ApiError'
import { ApiPrincipal } from '@/server/auth/apiPrincipal'
import { and, eq } from 'drizzle-orm'
import { cloneDeep, first } from 'lodash-es'
import {
  buildGameView,
  getCurrentMatchId,
  getGameForPrincipal,
} from './getGameView'
import { mutateGame } from './mutateGame'

const updateGame = async ({
  game,
  expectedRevision,
}: {
  game: Game
  expectedRevision: number
}) => {
  const updatedAt = new Date().toISOString()
  const updated = await db
    .update(schema.game)
    .set({
      data: game.data,
      revision: expectedRevision + 1,
      updatedAt,
    })
    .where(
      and(
        eq(schema.game.id, game.id),
        eq(schema.game.revision, expectedRevision),
      ),
    )
    .returning()
    .then(first)
  if (!updated) {
    const current = await db.query.game.findFirst({
      columns: { revision: true },
      where: eq(schema.game.id, game.id),
    })
    throw staleRevision(current?.revision ?? expectedRevision + 1)
  }
  return Game.parse(updated)
}

export const executeGameCommand = async ({
  gameId,
  input,
  principal,
}: {
  gameId: string
  input: GameCommandRequest
  principal: ApiPrincipal
}): Promise<GameCommandResponse> => {
  const game = await getGameForPrincipal({ gameId, principal })
  if (game.version !== GAME_VERSION) {
    throw invalidCommand('Commands cannot be applied to an old game version')
  }
  if (game.revision !== input.expectedRevision) {
    throw staleRevision(game.revision)
  }

  if (game.liveMatchId) {
    const participation = await db.query.liveMatchParticipation.findFirst({
      where: and(
        eq(schema.liveMatchParticipation.liveMatchId, game.liveMatchId),
        eq(schema.liveMatchParticipation.userId, game.userId),
      ),
    })
    if (participation?.data.ready) {
      throw invalidCommand(
        'This round is locked because you marked it as ready',
      )
    }
  }

  const currentMatchId = await getCurrentMatchId({
    gameId,
    roundNo: game.data.roundNo,
  })

  if (input.command.type === 'next-round') {
    if (!currentMatchId) throw invalidCommand('There is no completed match')
  } else if (currentMatchId) {
    throw invalidCommand('Start the next round before changing this game')
  }

  if (game.gameMode !== 'shopper') {
    throw invalidCommand('This command is only available in shopper mode')
  }

  if (input.command.type === 'fight') {
    if (game.liveMatchId) {
      throw invalidCommand('Live matches are started from the lobby')
    }

    const result = await fight({
      game,
      expectedRevision: input.expectedRevision,
    })
    return {
      view: await buildGameView({ game: result.game, principal }),
      result: { type: 'match-created', matchId: result.match.id },
    }
  }

  const nextGame = cloneDeep(game)
  const result = await mutateGame({
    game: nextGame,
    command: input.command,
    isAdmin: principal.isAdmin,
  })
  const updated = await updateGame({
    game: nextGame,
    expectedRevision: input.expectedRevision,
  })
  return {
    view: await buildGameView({ game: updated, principal }),
    result,
  }
}
