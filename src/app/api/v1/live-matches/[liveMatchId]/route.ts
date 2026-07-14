import { apiData, apiRoute } from '@/server/api/route'
import { getLiveMatchView } from '@/server/application/live/getLiveMatchView'
import { requireApiPrincipal } from '@/server/auth/apiPrincipal'

type RouteContext = { params: Promise<{ liveMatchId: string }> }

export const dynamic = 'force-dynamic'

export const GET = apiRoute(
  async (_context, request: Request, context: RouteContext) => {
    const { liveMatchId } = await context.params
    const principal = await requireApiPrincipal({
      request,
      requiredScopes: ['live:read'],
      allowDevAdmin: true,
    })
    return apiData(await getLiveMatchView({ liveMatchId, principal }))
  },
)
