import { auth } from '@/auth/auth'
import { isDev } from '@/auth/dev'
import { LeaderboardDto } from '@/contracts/watch'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import {
  LEADERBOARD_TYPE,
  LEADERBOARD_TYPE_ACC,
  NO_OF_ROUNDS,
} from '@/game/config'
import { getBotName } from '@/game/botName'
import { getLeaderboardRanked } from '@/game/getLeaderboard'
import { getUserName } from '@/game/getUserName'
import { fallbackThemeId } from '@/game/themes'
import { badRequest } from '@/server/api/ApiError'
import { apiData, apiRoute } from '@/server/api/route'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export const GET = apiRoute(async (_context, request: Request) => {
  const url = new URL(request.url)
  const parsedRound = Number(url.searchParams.get('round') ?? NO_OF_ROUNDS)
  const roundNo = parsedRound - 1
  if (!Number.isInteger(roundNo) || roundNo < 0 || roundNo >= NO_OF_ROUNDS) {
    throw badRequest('Invalid round')
  }
  const type = url.searchParams.get('type') ?? LEADERBOARD_TYPE_ACC
  if (type !== LEADERBOARD_TYPE && type !== LEADERBOARD_TYPE_ACC) {
    throw badRequest('Invalid leaderboard type')
  }

  const entries = await getLeaderboardRanked({ roundNo, type })
  const userId = (await auth())?.user?.id
  const viewer = userId
    ? await db.query.users.findFirst({ where: eq(schema.users.id, userId) })
    : null

  return apiData(
    LeaderboardDto.parse({
      roundNo,
      type,
      isAdmin: Boolean(viewer?.isAdmin || isDev()),
      entries: entries.map((entry) => ({
        id: entry.id,
        rank: entry.rank,
        score: entry.score,
        roundNo: entry.roundNo,
        type: entry.type,
        loadoutId: entry.loadoutId,
        gameId: entry.gameId,
        displayName: entry.user
          ? getUserName({ user: entry.user })
          : getBotName({ seed: entry.loadout.id }),
        themeId: fallbackThemeId(entry.user?.themeId),
        createdAt: entry.loadout.createdAt,
        loadout: entry.loadout.data,
      })),
    }),
  )
})
