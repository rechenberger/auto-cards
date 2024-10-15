import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { eq } from 'drizzle-orm'
import { addToLeaderboard } from './addToLeaderboard'

export const addToLeaderboardAllRounds = async ({
  gameId,
}: {
  gameId: string
}) => {
  const loadouts = await db.query.loadout.findMany({
    where: eq(schema.loadout.gameId, gameId),
  })

  for (const loadout of loadouts) {
    await addToLeaderboard({ loadout })
  }
}
