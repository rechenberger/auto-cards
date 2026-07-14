import { CatalogResponse } from '@/contracts/catalog'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { ItemDefinition } from '@/game/ItemDefinition'
import { getAllItems } from '@/game/allItems'
import { GAME_VERSION } from '@/game/config'
import { defaultThemeId, getAllThemes, ThemeId } from '@/game/themes'
import { badRequest } from '@/server/api/ApiError'
import { apiData, apiRoute } from '@/server/api/route'
import { and, desc, eq, isNotNull } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export const GET = apiRoute(async (_context, request: Request) => {
  const requestedThemeId =
    new URL(request.url).searchParams.get('themeId') ?? defaultThemeId
  const parsedThemeId = ThemeId.safeParse(requestedThemeId)
  if (!parsedThemeId.success) {
    throw badRequest('Unknown theme', { themeId: requestedThemeId })
  }
  const imageThemeId = parsedThemeId.data

  const [items, themes, imageRows] = await Promise.all([
    getAllItems(GAME_VERSION),
    getAllThemes(),
    db
      .select({
        itemId: schema.aiImage.itemId,
        themeId: schema.aiImage.themeId,
        url: schema.aiImage.url,
      })
      .from(schema.aiImage)
      .where(
        and(
          eq(schema.aiImage.themeId, imageThemeId),
          isNotNull(schema.aiImage.itemId),
        ),
      )
      .orderBy(desc(schema.aiImage.updatedAt)),
  ])

  const latestImages = new Map<string, (typeof imageRows)[number]>()
  for (const image of imageRows) {
    if (image.itemId && !latestImages.has(image.itemId)) {
      latestImages.set(image.itemId, image)
    }
  }

  const data = CatalogResponse.parse({
    apiVersion: 'v1',
    rulesetVersion: GAME_VERSION,
    imageThemeId,
    items: ItemDefinition.array().parse(items),
    themes,
    images: [...latestImages.values()],
  })

  return apiData(data, {
    headers: {
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
    },
  })
})
