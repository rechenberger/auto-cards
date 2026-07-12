import { CreateGameRequest } from '@/contracts/game-api'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { GAME_VERSION, LIMIT_GAME_OVERVIEW } from '@/game/config'
import { createGame } from '@/game/createGame'
import { badRequest } from '@/server/api/ApiError'
import { apiData, apiRoute, parseJson } from '@/server/api/route'
import { withIdempotency } from '@/server/api/idempotency'
import { buildGameView } from '@/server/application/games/getGameView'
import { requireApiPrincipal } from '@/server/auth/apiPrincipal'
import { and, desc, eq } from 'drizzle-orm'
import { after } from 'next/server'
import { runDueJobs } from '@/server/jobs/runJobs'

export const GET = apiRoute(async (_context, request: Request) => {
  const principal = await requireApiPrincipal({
    request,
    requiredScopes: ['game:read'],
    allowDevAdmin: true,
  })
  const games = await db.query.game.findMany({
    where: and(
      eq(schema.game.userId, principal.userId),
      eq(schema.game.version, GAME_VERSION),
    ),
    orderBy: desc(schema.game.updatedAt),
    limit: LIMIT_GAME_OVERVIEW,
  })

  return apiData({
    games: await Promise.all(
      games.map((game) => buildGameView({ game, principal })),
    ),
    isAdmin: principal.isAdmin,
  })
})

export const POST = apiRoute(async (_context, request: Request) => {
  const principal = await requireApiPrincipal({
    request,
    requiredScopes: ['game:write'],
    allowDevAdmin: true,
  })
  const response = await withIdempotency({
    request,
    principal,
    scope: 'games:create',
    handler: async (body) => {
      const input = CreateGameRequest.safeParse(parseJson(body))
      if (!input.success) {
        throw badRequest('Invalid game input', input.error.flatten())
      }
      if (input.data.gameMode === 'collector' && !principal.isAdmin) {
        throw badRequest('Collector mode is currently admin-only')
      }

      const game = await createGame({
        userId: principal.userId,
        gameMode: input.data.gameMode,
      })
      return apiData(await buildGameView({ game, principal }), { status: 201 })
    },
  })
  after(() => runDueJobs({ limit: 2, deadline: Date.now() + 10_000 }))
  return response
})
