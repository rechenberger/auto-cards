import { getIsAdmin } from '@/auth/getIsAdmin'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { Loadout } from '@/db/schema-zod'
import { addToLeaderboard } from '@/game/addToLeaderboard'
import { GREAT_WIN_RATE } from '@/game/config'
import { getLeaderboard } from '@/game/getLeaderboard'
import { getOrdinalSuffix } from '@/lib/getOrdinalSuffix'
import { cn } from '@/lib/utils'
import { superAction } from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { eq } from 'drizzle-orm'
import { ExternalLink } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { SimpleRefresher } from '../simple/SimpleRefresher'
import { Button } from '../ui/button'

export const LeaderboardRankCard = async ({
  loadout,
}: {
  loadout: Loadout
}) => {
  const leaderboard = await getLeaderboard({ roundNo: loadout.roundNo })
  const leaderboardIdx = leaderboard.findIndex(
    (e) => e.loadoutId === loadout.id,
  )
  const top = leaderboardIdx !== -1
  let entry = top ? leaderboard[leaderboardIdx] : undefined

  const isAdmin = await getIsAdmin({ allowDev: true })

  if (!entry) {
    entry = await db.query.leaderboardEntry.findFirst({
      where: eq(schema.leaderboardEntry.loadoutId, loadout.id),
      with: {
        user: true,
        loadout: true,
      },
    })
  }

  // if (!entry) {
  //   await addToLeaderboard({ loadout })
  //   entry = await db.query.leaderboardEntry.findFirst({
  //     where: eq(schema.leaderboardEntry.loadoutId, loadout.id),
  //     with: {
  //       user: true,
  //       loadout: true,
  //     },
  //   })
  // }

  if (!entry) {
    // console.warn('Leaderboard entry not found')
    return (
      <>
        <div className="flex flex-col gap-4 bg-background/80 p-4 rounded-lg">
          <div className="flex flex-row gap-4 items-center justify-center">
            <div className="flex-1">Calculating Score...</div>
            <SimpleRefresher ms={2000} forceState={true} />
          </div>
          {isAdmin && (
            <ActionButton
              action={async () => {
                'use server'
                return superAction(async () => {
                  await addToLeaderboard({ loadout })
                  revalidatePath('/', 'layout')
                })
              }}
            >
              Add to Leaderboard
            </ActionButton>
          )}
        </div>
      </>
    )
  }

  return (
    <>
      <div
        className={cn(
          'flex flex-col gap-4 items-center justify-center bg-background/80 p-4 rounded-lg',
          top && 'border-2 border-amber-300',
        )}
      >
        {entry.score >= GREAT_WIN_RATE && (
          <div
            className={cn(
              'text-xl font-bold',
              top ? 'text-amber-300' : 'text-green-500',
            )}
          >
            {top ? 'Awesome!' : 'Great!'}
          </div>
        )}
        <div className="flex flex-col items-center gap-1">
          <div className="text-xs">Your cards have a win-rate of</div>
          <div
            className={cn(
              'text-xl font-bold font-sans',
              top
                ? 'text-amber-300'
                : entry.score >= GREAT_WIN_RATE
                  ? 'text-green-500'
                  : 'text-gray-500',
            )}
          >
            {entry.score.toFixed(2)}%
          </div>
          <div className="text-xs">
            against the <strong>Top {leaderboard.length}</strong> Leaderboard.
          </div>
        </div>

        {top && (
          <div className="flex flex-col items-center gap-1">
            <div className="text-xs">Making this the</div>
            <div
              className={cn('text-4xl font-bold font-sans', 'text-amber-300')}
            >
              {leaderboardIdx + 1}
              <span className="ordinal">
                {getOrdinalSuffix(leaderboardIdx + 1)}
              </span>
            </div>
            <div className="text-xs font-bold">Best Build in the World.</div>
          </div>
        )}

        <Button variant={'ghost'} asChild size={'sm'}>
          <Link href={`/watch/leaderboard`}>
            View Leaderboard <ExternalLink className="ml-1 mb-0.5 size-4" />
          </Link>
        </Button>
      </div>
    </>
  )
}
