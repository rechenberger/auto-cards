import { auth } from '@/auth/auth'
import { isDev } from '@/auth/dev'
import { RecentGamesDto } from '@/contracts/watch'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { getUserName } from '@/game/getUserName'
import { apiData, apiRoute } from '@/server/api/route'
import { desc, eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export const GET = apiRoute(async () => {
  const userId = (await auth())?.user?.id
  const viewer = userId
    ? await db.query.users.findFirst({ where: eq(schema.users.id, userId) })
    : null
  const isAdmin = Boolean(viewer?.isAdmin || isDev())
  const games = await db.query.game.findMany({
    orderBy: desc(schema.game.updatedAt),
    limit: 24,
    where: isAdmin ? undefined : eq(schema.game.gameMode, 'shopper'),
    with: {
      user: true,
      loadouts: { with: { primaryMatchParticipation: true } },
    },
  })

  return apiData(
    RecentGamesDto.parse({
      games: games.map((game) => ({
        id: game.id,
        displayName: getUserName({ user: game.user }),
        updatedAt: game.updatedAt,
        version: game.version,
        gameMode: game.gameMode,
        dungeonAccesses: game.data.dungeonAccesses,
        rounds: game.loadouts.map((loadout) => ({
          roundNo: loadout.roundNo,
          status: loadout.primaryMatchParticipation?.status ?? null,
          matchId: loadout.primaryMatchParticipation?.matchId ?? null,
        })),
      })),
    }),
  )
})
