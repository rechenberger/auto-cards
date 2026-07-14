import { apiData, apiRoute } from '@/server/api/route'
import { getMatchReplay } from '@/server/application/matches/getMatchReplay'

type RouteContext = { params: Promise<{ matchId: string }> }

export const dynamic = 'force-dynamic'

export const GET = apiRoute(
  async (_context, _request: Request, routeContext: RouteContext) => {
    const { matchId } = await routeContext.params
    const replay = await getMatchReplay({ matchId })
    return apiData(replay, {
      headers: { 'Cache-Control': 'private, no-store' },
    })
  },
)
