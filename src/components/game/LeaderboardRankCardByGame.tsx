import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { desc, eq } from 'drizzle-orm'
import { LeaderboardRankCard } from './LeaderboardRankCard'

export const LeaderboardRankCardByGame = async ({
  gameId,
  tiny,
}: {
  gameId: string
  tiny?: boolean
}) => {
  const loadout = await db.query.loadout.findFirst({
    where: eq(schema.loadout.gameId, gameId),
    orderBy: desc(schema.loadout.roundNo),
  })

  if (!loadout) return null

  return <LeaderboardRankCard loadout={loadout} tiny={tiny} />
}
