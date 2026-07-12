import { apiData, apiRoute } from '@/server/api/route'
import { getGameView } from '@/server/application/games/getGameView'
import {
  requireApiAdmin,
  requireApiPrincipal,
} from '@/server/auth/apiPrincipal'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { eq } from 'drizzle-orm'

type RouteContext = { params: Promise<{ gameId: string }> }

export const GET = apiRoute(
  async (_context, request: Request, ctx: RouteContext) => {
    const { gameId } = await ctx.params
    const principal = await requireApiPrincipal({
      request,
      requiredScopes: ['game:read'],
      allowDevAdmin: true,
    })
    const view = await getGameView({ gameId, principal })
    return apiData(view)
  },
)

export const DELETE = apiRoute(
  async (_context, request: Request, ctx: RouteContext) => {
    await requireApiAdmin({
      request,
      requiredScopes: ['admin'],
      allowDev: true,
    })
    const { gameId } = await ctx.params
    await db.delete(schema.game).where(eq(schema.game.id, gameId))
    return new Response(null, { status: 204 })
  },
)
