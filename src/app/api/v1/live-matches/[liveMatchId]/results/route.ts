import { apiData, apiRoute } from '@/server/api/route'
import { getLiveMatchResults } from '@/server/application/live/getLiveMatchView'

type RouteContext = { params: Promise<{ liveMatchId: string }> }

export const dynamic = 'force-dynamic'

export const GET = apiRoute(
  async (_context, _request: Request, context: RouteContext) => {
    const { liveMatchId } = await context.params
    return apiData(await getLiveMatchResults({ liveMatchId }))
  },
)
