import { ActivateAiImageResultDto } from '@/contracts/ai-images'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { notFound } from '@/server/api/ApiError'
import { withIdempotency } from '@/server/api/idempotency'
import { apiData, apiRoute } from '@/server/api/route'
import { requireApiAdmin } from '@/server/auth/apiPrincipal'
import { eq } from 'drizzle-orm'

type RouteContext = { params: Promise<{ imageId: string }> }

export const PATCH = apiRoute(
  async (_context, request: Request, context: RouteContext) => {
    const principal = await requireApiAdmin({
      request,
      requiredScopes: ['admin'],
      allowDev: true,
    })
    const { imageId } = await context.params
    return withIdempotency({
      request,
      principal,
      scope: `admin:ai-image:${imageId}:activate`,
      handler: async () => {
        const rows = await db
          .update(schema.aiImage)
          .set({ updatedAt: new Date().toISOString() })
          .where(eq(schema.aiImage.id, imageId))
          .returning()
        const image = rows[0]
        if (!image) throw notFound('Image not found')
        return apiData(ActivateAiImageResultDto.parse({ image }))
      },
    })
  },
)
