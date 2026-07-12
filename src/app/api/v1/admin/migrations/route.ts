import {
  AdminMigrationCommand,
  AdminMigrationResultDto,
  AdminMigrationStatusDto,
} from '@/contracts/admin'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { badRequest } from '@/server/api/ApiError'
import { withIdempotency } from '@/server/api/idempotency'
import { apiData, apiRoute, parseJson } from '@/server/api/route'
import { requireApiAdmin } from '@/server/auth/apiPrincipal'
import { count, isNull, sql } from 'drizzle-orm'

const missingCount = async () =>
  db
    .select({ value: count() })
    .from(schema.leaderboardEntry)
    .where(isNull(schema.leaderboardEntry.gameId))
    .then((rows) => rows[0]?.value ?? 0)

export const GET = apiRoute(async (_context, request: Request) => {
  await requireApiAdmin({
    request,
    requiredScopes: ['admin'],
    allowDev: true,
  })
  return apiData(
    AdminMigrationStatusDto.parse({
      leaderboardMissingGameId: await missingCount(),
    }),
    { headers: { 'Cache-Control': 'private, no-store' } },
  )
})

export const POST = apiRoute(async (_context, request: Request) => {
  const principal = await requireApiAdmin({
    request,
    requiredScopes: ['admin'],
    allowDev: true,
  })
  return withIdempotency({
    request,
    principal,
    scope: 'admin:migrations:run',
    handler: async (body) => {
      const parsed = AdminMigrationCommand.safeParse(parseJson(body))
      if (!parsed.success) {
        throw badRequest('Invalid migration command', parsed.error.flatten())
      }
      const result = await db.run(sql`
        UPDATE leaderboardEntry
        SET gameId = (
          SELECT loadout.gameId
          FROM loadout
          WHERE loadout.id = leaderboardEntry.loadoutId
        )
        WHERE gameId IS NULL
          AND EXISTS (
            SELECT 1
            FROM loadout
            WHERE loadout.id = leaderboardEntry.loadoutId
              AND loadout.gameId IS NOT NULL
          )
      `)
      return apiData(
        AdminMigrationResultDto.parse({
          updated: result.rowsAffected,
          remaining: await missingCount(),
        }),
      )
    },
  })
})
