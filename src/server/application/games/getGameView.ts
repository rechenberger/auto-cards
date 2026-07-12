import { GameViewDto } from '@/contracts/game-api'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { Game } from '@/db/schema-zod'
import { GAME_VERSION, NO_OF_ROUNDS } from '@/game/config'
import { and, eq } from 'drizzle-orm'
import { forbidden, notFound } from '@/server/api/ApiError'
import { ApiPrincipal } from '@/server/auth/apiPrincipal'

type GameWithRevision = Game & { revision?: number }

export const getCurrentMatchId = async ({
  gameId,
  roundNo,
}: {
  gameId: string
  roundNo: number
}) => {
  const loadout = await db.query.loadout.findFirst({
    where: and(
      eq(schema.loadout.gameId, gameId),
      eq(schema.loadout.roundNo, roundNo),
    ),
    with: {
      primaryMatchParticipation: {
        with: { match: true },
      },
    },
  })
  return loadout?.primaryMatchParticipation?.match?.id ?? null
}

export const getGameForPrincipal = async ({
  gameId,
  principal,
}: {
  gameId: string
  principal: ApiPrincipal
}): Promise<GameWithRevision> => {
  const row = await db.query.game.findFirst({
    where: eq(schema.game.id, gameId),
  })
  if (!row) throw notFound('Game not found')
  if (row.userId !== principal.userId && !principal.isAdmin) {
    throw forbidden('You cannot access this game')
  }
  return Game.parse(row) as GameWithRevision
}

export const buildGameView = async ({
  game,
  principal,
}: {
  game: GameWithRevision
  principal: ApiPrincipal
}): Promise<GameViewDto> => {
  const isOldVersion = game.version !== GAME_VERSION
  const loadouts = await db.query.loadout.findMany({
    where: eq(schema.loadout.gameId, game.id),
    with: { primaryMatchParticipation: true },
  })
  const currentLoadout = loadouts.find(
    (loadout) => loadout.roundNo === game.data.roundNo,
  )
  const currentMatchId =
    currentLoadout?.primaryMatchParticipation?.matchId ?? null
  const latestLoadout = loadouts.toSorted((a, b) => b.roundNo - a.roundNo)[0]

  const phase = isOldVersion
    ? 'ended'
    : game.gameMode === 'collector'
      ? 'collector'
      : game.data.roundNo >= NO_OF_ROUNDS
        ? 'ended'
        : currentMatchId
          ? 'match'
          : 'shop'

  return GameViewDto.parse({
    game: {
      id: game.id,
      userId: game.userId,
      data: game.data,
      liveMatchId: game.liveMatchId,
      version: game.version,
      revision: game.revision ?? 0,
      gameMode: game.gameMode,
      createdAt: game.createdAt,
      updatedAt: game.updatedAt,
    },
    phase,
    currentMatchId,
    rounds: loadouts.map((loadout) => ({
      roundNo: loadout.roundNo,
      status: loadout.primaryMatchParticipation?.status ?? null,
      matchId: loadout.primaryMatchParticipation?.matchId ?? null,
      loadoutId: loadout.id,
    })),
    latestLoadoutId: latestLoadout?.id ?? null,
    isAdmin: principal.isAdmin,
    isOldVersion,
  })
}

export const getGameView = async ({
  gameId,
  principal,
}: {
  gameId: string
  principal: ApiPrincipal
}) => {
  const game = await getGameForPrincipal({ gameId, principal })
  return buildGameView({ game, principal })
}
