import { throwIfNotAdmin } from '@/auth/getIsAdmin'
import { db } from '@/db/db'
import { leaderboardEntry } from '@/db/schema'
import { ActionButton } from '@/super-action/button/ActionButton'
import { eq, isNull } from 'drizzle-orm'
import { chunk } from 'lodash-es'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Migrations',
}

export default async function Page() {
  await throwIfNotAdmin({ allowDev: true })
  return (
    <>
      <ActionButton
        action={async () => {
          'use server'
          const leaderboard = await db.query.leaderboardEntry.findMany({
            where: isNull(leaderboardEntry.gameId),
            with: {
              loadout: true,
            },
            // limit: 10,
          })
          for (const entries of chunk(leaderboard, 10)) {
            await Promise.all(
              entries.map(async (entry) => {
                await db
                  .update(leaderboardEntry)
                  .set({
                    gameId: entry.loadout.gameId,
                  })
                  .where(eq(leaderboardEntry.id, entry.id))
              }),
            )
          }
        }}
      >
        Leaderboard GameId
      </ActionButton>
    </>
  )
}
