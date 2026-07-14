import { LiveMatchCommand } from '@/contracts/live-api'
import { badRequest } from '@/server/api/ApiError'
import { withIdempotency } from '@/server/api/idempotency'
import { apiData, apiRoute, parseJson } from '@/server/api/route'
import { executeLiveMatchCommand } from '@/server/application/live/executeLiveMatchCommand'
import { requireApiPrincipal } from '@/server/auth/apiPrincipal'

type RouteContext = { params: Promise<{ liveMatchId: string }> }

export const POST = apiRoute(
  async (_context, request: Request, context: RouteContext) => {
    const { liveMatchId } = await context.params
    const principal = await requireApiPrincipal({
      request,
      requiredScopes: ['live:write'],
      allowDevAdmin: true,
    })
    return withIdempotency({
      request,
      principal,
      scope: `live-match:${liveMatchId}:command`,
      handler: async (body) => {
        const parsed = LiveMatchCommand.safeParse(parseJson(body))
        if (!parsed.success) {
          throw badRequest('Invalid live match command', parsed.error.flatten())
        }
        return apiData(
          await executeLiveMatchCommand({
            liveMatchId,
            command: parsed.data,
            principal,
          }),
        )
      },
    })
  },
)
