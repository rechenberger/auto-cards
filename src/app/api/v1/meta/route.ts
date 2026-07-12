import { auth } from '@/auth/auth'
import { isDev } from '@/auth/dev'
import { MetaResponse } from '@/contracts/meta'
import { db } from '@/db/db'
import { users } from '@/db/schema-auth'
import { GAME_VERSION, NO_OF_ROUNDS } from '@/game/config'
import { fallbackThemeId } from '@/game/themes'
import { apiData, apiRoute } from '@/server/api/route'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export const GET = apiRoute(async () => {
  const session = await auth()
  const userId = session?.user?.id
  const user = userId
    ? await db.query.users.findFirst({
        columns: { id: true, isAdmin: true, themeId: true },
        where: eq(users.id, userId),
      })
    : null

  const data = MetaResponse.parse({
    apiVersion: 'v1',
    openApiUrl: '/api/openapi.json',
    rulesetVersion: GAME_VERSION,
    numberOfRounds: NO_OF_ROUNDS,
    replay: {
      format: 'seed-loadouts',
      logsIncluded: false,
    },
    viewer: user
      ? {
          id: user.id,
          isAdmin: Boolean(user.isAdmin || isDev()),
          themeId: await fallbackThemeId(user.themeId),
        }
      : null,
  })

  return apiData(data, {
    headers: {
      'Cache-Control': 'private, no-store',
      Vary: 'Cookie',
      Link: '</api/openapi.json>; rel="service-desc"; type="application/vnd.oai.openapi+json"',
    },
  })
})
