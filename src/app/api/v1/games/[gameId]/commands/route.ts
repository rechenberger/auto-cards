import { GameCommandRequest } from '@/contracts/game-api'
import { badRequest } from '@/server/api/ApiError'
import { withIdempotency } from '@/server/api/idempotency'
import { apiData, apiRoute, parseJson } from '@/server/api/route'
import { executeGameCommand } from '@/server/application/games/executeGameCommand'
import { requireApiPrincipal } from '@/server/auth/apiPrincipal'
import { runDueJobs } from '@/server/jobs/runJobs'
import { after } from 'next/server'

type RouteContext = { params: Promise<{ gameId: string }> }

export const POST = apiRoute(
  async (_context, request: Request, ctx: RouteContext) => {
    const { gameId } = await ctx.params
    const principal = await requireApiPrincipal({
      request,
      requiredScopes: ['game:write'],
      allowDevAdmin: true,
    })
    const response = await withIdempotency({
      request,
      principal,
      scope: `game:${gameId}:command`,
      handler: async (body) => {
        const parsed = GameCommandRequest.safeParse(parseJson(body))
        if (!parsed.success) {
          throw badRequest('Invalid game command', parsed.error.flatten())
        }
        return apiData(
          await executeGameCommand({ gameId, input: parsed.data, principal }),
        )
      },
    })
    after(async () => {
      await runDueJobs({ limit: 5, deadline: Date.now() + 45_000 })
    })
    return response
  },
)
