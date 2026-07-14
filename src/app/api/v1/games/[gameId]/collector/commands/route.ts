import { CollectorCommandRequest } from '@/contracts/collector-api'
import { badRequest } from '@/server/api/ApiError'
import { withIdempotency } from '@/server/api/idempotency'
import { apiData, apiRoute, parseJson } from '@/server/api/route'
import { executeCollectorCommand } from '@/server/application/games/executeCollectorCommand'
import { requireApiPrincipal } from '@/server/auth/apiPrincipal'

type RouteContext = { params: Promise<{ gameId: string }> }

export const POST = apiRoute(
  async (_context, request: Request, ctx: RouteContext) => {
    const { gameId } = await ctx.params
    const principal = await requireApiPrincipal({
      request,
      requiredScopes: ['game:write'],
      allowDevAdmin: true,
    })
    return withIdempotency({
      request,
      principal,
      scope: `game:${gameId}:collector-command`,
      handler: async (body) => {
        const parsed = CollectorCommandRequest.safeParse(parseJson(body))
        if (!parsed.success) {
          throw badRequest('Invalid collector command', parsed.error.flatten())
        }
        return apiData(
          await executeCollectorCommand({
            gameId,
            input: parsed.data,
            principal,
          }),
        )
      },
    })
  },
)
