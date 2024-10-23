import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { eq } from 'drizzle-orm'
import { orderBy } from 'lodash-es'
import { addToLeaderboard } from './addToLeaderboard'

export const addToLeaderboardAllRounds = async ({
  gameId,
}: {
  gameId: string
}) => {
  let loadouts = await db.query.loadout.findMany({
    where: eq(schema.loadout.gameId, gameId),
  })

  loadouts = orderBy(loadouts, (l) => l.roundNo, 'asc')

  for (const loadout of loadouts) {
    await addToLeaderboard({ loadout })
  }
}
