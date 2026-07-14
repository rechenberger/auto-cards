import { AdminBotsDto } from '@/contracts/admin'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { Loadout } from '@/db/schema-zod'
import { GAME_VERSION, NO_OF_ROUNDS } from '@/game/config'
import { DefaultGameMode } from '@/game/gameMode'
import { getSimulationStartForRound } from '@/game/simulationConfig'
import { apiData, apiRoute } from '@/server/api/route'
import { requireApiAdmin } from '@/server/auth/apiPrincipal'
import { and, asc, eq, isNull } from 'drizzle-orm'
import { range } from 'lodash-es'

export const dynamic = 'force-dynamic'

export const GET = apiRoute(async (_context, request: Request) => {
  await requireApiAdmin({
    request,
    requiredScopes: ['admin'],
    allowDev: true,
  })
  const loadouts = Loadout.array().parse(
    await db.query.loadout.findMany({
      where: and(
        isNull(schema.loadout.userId),
        eq(schema.loadout.version, GAME_VERSION),
        eq(schema.loadout.gameMode, DefaultGameMode),
      ),
      orderBy: asc(schema.loadout.createdAt),
    }),
  )
  return apiData(
    AdminBotsDto.parse({
      rulesetVersion: GAME_VERSION,
      rounds: range(NO_OF_ROUNDS).map((roundNo) => ({
        roundNo,
        gold: getSimulationStartForRound(roundNo).startingGold,
        loadouts: loadouts
          .filter((loadout) => loadout.roundNo === roundNo)
          .map((loadout) => ({
            id: loadout.id,
            roundNo: loadout.roundNo,
            data: loadout.data,
          })),
      })),
    }),
    { headers: { 'Cache-Control': 'private, no-store' } },
  )
})
