import { CreateLiveMatchRequest } from '@/contracts/live-api'
import { badRequest } from '@/server/api/ApiError'
import { withIdempotency } from '@/server/api/idempotency'
import { apiData, apiRoute, parseJson } from '@/server/api/route'
import { createLiveMatch } from '@/server/application/live/createLiveMatch'
import { getLatestLiveMatches } from '@/server/application/live/getLiveMatchView'

export const dynamic = 'force-dynamic'

export const GET = apiRoute(async () => apiData(await getLatestLiveMatches()))

export const POST = apiRoute(async (_context, request: Request) => {
  const { requireApiPrincipal } = await import('@/server/auth/apiPrincipal')
  const principal = await requireApiPrincipal({
    request,
    requiredScopes: ['live:write'],
    allowDevAdmin: true,
  })
  return withIdempotency({
    request,
    principal,
    scope: 'live-matches:create',
    handler: async (body) => {
      const parsed = CreateLiveMatchRequest.safeParse(parseJson(body))
      if (!parsed.success) {
        throw badRequest('Invalid live match input', parsed.error.flatten())
      }
      return apiData(await createLiveMatch({ principal }), { status: 201 })
    },
  })
})
