import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { asc, eq } from 'drizzle-orm'
import { addToLeaderboard } from './addToLeaderboard'
import { LEADERBOARD_TYPE, NO_OF_ROUNDS } from './config'

export const addAllToLeaderboard = async ({
  type = LEADERBOARD_TYPE,
  roundNo = NO_OF_ROUNDS - 1,
}: {
  type?: string
  roundNo?: number
}) => {
  const loadouts = await db.query.loadout.findMany({
    where: eq(schema.loadout.roundNo, roundNo),
    orderBy: asc(schema.loadout.createdAt),
  })

  for (const loadout of loadouts) {
    await addToLeaderboard({ loadout, type, roundNo })
  }
}
