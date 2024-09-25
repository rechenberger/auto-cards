import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { and, asc, eq } from 'drizzle-orm'
import { addToLeaderboard } from './addToLeaderboard'
import { GAME_VERSION, LEADERBOARD_TYPE, NO_OF_ROUNDS } from './config'

export const addAllToLeaderboard = async ({
  type = LEADERBOARD_TYPE,
  roundNo = NO_OF_ROUNDS - 1,
  onUpdate,
}: {
  type?: string
  roundNo?: number
  onUpdate?: (info: { current: number; total: number; done: boolean }) => void
}) => {
  const loadouts = await db.query.loadout.findMany({
    where: and(
      eq(schema.loadout.roundNo, roundNo),
      eq(schema.loadout.version, GAME_VERSION),
    ),
    orderBy: asc(schema.loadout.createdAt),
  })

  let current = 0
  for (const loadout of loadouts) {
    onUpdate?.({ current, total: loadouts.length, done: false })
    await addToLeaderboard({ loadout, type, roundNo })
    current++
  }
  onUpdate?.({ current, total: loadouts.length, done: true })
}
