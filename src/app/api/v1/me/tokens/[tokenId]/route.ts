import { RevokeApiTokenDto } from '@/contracts/api-token'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { notFound } from '@/server/api/ApiError'
import { apiData, apiRoute } from '@/server/api/route'
import { requireApiSession } from '@/server/auth/apiPrincipal'
import { and, eq } from 'drizzle-orm'

type RouteContext = { params: Promise<{ tokenId: string }> }

export const DELETE = apiRoute(
  async (_context, _request: Request, context: RouteContext) => {
    const principal = await requireApiSession({ allowDevAdmin: true })
    const { tokenId } = await context.params
    const token = await db.query.apiToken.findFirst({
      columns: { id: true },
      where: and(
        eq(schema.apiToken.id, tokenId),
        eq(schema.apiToken.userId, principal.userId),
      ),
    })
    if (!token) throw notFound('API token not found')

    await db
      .update(schema.apiToken)
      .set({ revokedAt: new Date().toISOString() })
      .where(
        and(
          eq(schema.apiToken.id, tokenId),
          eq(schema.apiToken.userId, principal.userId),
        ),
      )
    return apiData(RevokeApiTokenDto.parse({ revoked: true }), {
      headers: { 'Cache-Control': 'private, no-store' },
    })
  },
)
