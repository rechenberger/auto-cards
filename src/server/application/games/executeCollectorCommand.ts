import {
  CollectorCommandRequest,
  CollectorCommandResponse,
} from '@/contracts/collector-api'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { Game } from '@/db/schema-zod'
import { GAME_VERSION } from '@/game/config'
import { invalidCommand, staleRevision } from '@/server/api/ApiError'
import { ApiPrincipal } from '@/server/auth/apiPrincipal'
import { and, eq } from 'drizzle-orm'
import { cloneDeep, first } from 'lodash-es'
import { buildGameView, getGameForPrincipal } from './getGameView'
import { mutateCollectorGame } from './mutateCollectorGame'

const persistCollectorGame = async ({
  game,
  expectedRevision,
}: {
  game: Game
  expectedRevision: number
}) => {
  const updated = await db
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

  if (!updated) {
    const current = await db.query.game.findFirst({
      columns: { revision: true },
      where: eq(schema.game.id, game.id),
    })
    throw staleRevision(current?.revision ?? expectedRevision + 1)
  }
  return Game.parse(updated)
}

export const executeCollectorCommand = async ({
  gameId,
  input,
  principal,
}: {
  gameId: string
  input: CollectorCommandRequest
  principal: ApiPrincipal
}): Promise<CollectorCommandResponse> => {
  const game = await getGameForPrincipal({ gameId, principal })
  if (game.gameMode !== 'collector') {
    throw invalidCommand('This command is only available in collector mode')
  }
  if (
    input.rulesetVersion !== GAME_VERSION ||
    game.version !== input.rulesetVersion ||
    game.data.version !== input.rulesetVersion
  ) {
    throw invalidCommand(
      'Collector ruleset version does not match the server',
      {
        activeRulesetVersion: GAME_VERSION,
        gameRulesetVersion: game.version,
      },
    )
  }
  if (game.revision !== input.expectedRevision) {
    throw staleRevision(game.revision)
  }

  const nextGame = cloneDeep(game)
  const result = await mutateCollectorGame({
    game: nextGame,
    command: input.command,
    isAdmin: principal.isAdmin,
  })
  const updated = await persistCollectorGame({
    game: nextGame,
    expectedRevision: input.expectedRevision,
  })
  return {
    view: await buildGameView({ game: updated, principal }),
    result,
  }
}
