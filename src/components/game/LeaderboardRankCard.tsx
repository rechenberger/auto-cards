import { getIsAdmin } from '@/auth/getIsAdmin'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { LeaderboardEntry, Loadout } from '@/db/schema-zod'
import { addToLeaderboardAllRounds } from '@/game/addToLeaderboardAllRounds'
import {
  GAME_VERSION,
  GREAT_WIN_RATE,
  LEADERBOARD_LIMIT,
  LEADERBOARD_TYPE_ACC,
} from '@/game/config'
import { getLeaderboardRanked } from '@/game/getLeaderboard'
import { revalidateLeaderboard } from '@/game/revalidateLeaderboard'
import { getOrdinalSuffix } from '@/lib/getOrdinalSuffix'
import { cn } from '@/lib/utils'
import { superAction } from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { and, eq } from 'drizzle-orm'
import { ExternalLink, Plus } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { SimpleRefresher } from '../simple/SimpleRefresher'
import { Button } from '../ui/button'
import { streamLeaderboardAccCalculation } from './LeaderboardAccCalculation'

export const LeaderboardRankCard = async ({
  loadout,
  tiny,
  entry,
}: {
  loadout: Loadout
  tiny?: boolean
  entry?: LeaderboardEntry & { rank: number }
}) => {
  if (!entry) {
    const leaderboard = await getLeaderboardRanked({
      roundNo: loadout.roundNo,
      type: LEADERBOARD_TYPE_ACC,
    })
    entry = leaderboard.find((e) => e.loadoutId === loadout.id)
  }
  const top = !!entry

  const isAdmin = await getIsAdmin({ allowDev: true })

  if (!entry) {
    const entryDb = await db.query.leaderboardEntry.findFirst({
      where: and(
        eq(schema.leaderboardEntry.roundNo, loadout.roundNo),
        eq(schema.leaderboardEntry.version, GAME_VERSION),
        eq(schema.leaderboardEntry.type, LEADERBOARD_TYPE_ACC),
        eq(schema.leaderboardEntry.loadoutId, loadout.id),
      ),
      with: {
        user: true,
        loadout: true,
      },
    })
    if (entryDb) {
      entry = {
        ...entryDb,
        rank: 99,
      }
    }
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

  const great = !!entry?.score && entry.score >= GREAT_WIN_RATE

  const top3 = entry?.rank && entry.rank <= 3

  const textColor = top3
    ? 'text-black'
    : top
      ? 'text-amber-300'
      : great
        ? 'text-green-500'
        : 'text-gray-500'

  const borderColor = top
    ? 'border-amber-300'
    : great
      ? 'border-green-500'
      : 'border-gray-500'

  const classTop3 = cn(
    entry?.rank === 1 &&
      'bg-gradient-to-bl from-amber-100 to-amber-500 text-black',
    entry?.rank === 2 &&
      'bg-gradient-to-bl from-gray-100 to-gray-500 text-black border-gray-300',
    entry?.rank === 3 &&
      'bg-gradient-to-bl from-orange-100 to-orange-500 text-black border-orange-300',
  )

  if (tiny) {
    if (!entry) {
      if (isAdmin) {
        return (
          <ActionButton
            variant={'outline'}
            size={'icon'}
            hideIcon
            action={async () => {
              'use server'
              // await addToLeaderboard({ loadout })
              if (loadout.gameId) {
                await addToLeaderboardAllRounds({ gameId: loadout.gameId })
              }
              revalidateLeaderboard()
            }}
          >
            <Plus className="size-4" />
          </ActionButton>
        )
      }

      return null
    }
    return (
      <>
        <ActionButton
          variant={'vanilla'}
          size={'vanilla'}
          hideIcon
          action={async () => {
            'use server'
            return streamLeaderboardAccCalculation({ gameId: entry.gameId })
          }}
        >
          <div
            className={cn(
              'flex flex-col items-center justify-center',
              textColor,
              'rounded-md border-2 px-2 py-1',
              'w-24',
              borderColor,
              classTop3,
            )}
          >
            {top && entry ? (
              <div className={cn('text-4xl font-bold font-sans')}>
                {entry.rank}
                <span className="ordinal">{getOrdinalSuffix(entry.rank)}</span>
              </div>
            ) : entry.score >= GREAT_WIN_RATE ? (
              <div className={cn('text-xl font-bold font-sans')}>GREAT</div>
            ) : null}
            <div className="font-sans">{entry?.score.toFixed(2)}%</div>
          </div>
        </ActionButton>
      </>
    )
  }

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
                  // await addToLeaderboard({ loadout })
                  if (loadout.gameId) {
                    await addToLeaderboardAllRounds({ gameId: loadout.gameId })
                  }
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
          classTop3,
        )}
      >
        {great && (
          <div className={cn('text-xl font-bold', textColor)}>
            {top ? 'Awesome!' : 'Great!'}
          </div>
        )}
        <div className="flex flex-col items-center gap-1">
          <div className="text-xs">Your cards have a win-rate of</div>
          <div className={cn('text-xl font-bold font-sans', textColor)}>
            {entry.score.toFixed(2)}%
          </div>
          <div className="text-xs">
            against the <strong>Top {LEADERBOARD_LIMIT}</strong> Leaderboard.
          </div>
        </div>

        {top && (
          <div className="flex flex-col items-center gap-1">
            <div className="text-xs">Making this the</div>
            <div className={cn('text-4xl font-bold font-sans', textColor)}>
              {entry.rank}
              <span className="ordinal">{getOrdinalSuffix(entry.rank)}</span>
            </div>
            <div className="text-xs font-bold">Best Build in the World.</div>
          </div>
        )}

        <div className="flex flex-col">
          <ActionButton
            variant="ghost"
            hideIcon
            className="flex-1"
            action={async () => {
              'use server'
              return streamLeaderboardAccCalculation({
                gameId: entry.gameId,
              })
            }}
          >
            See Calculation <ExternalLink className="ml-1 mb-0.5 size-4" />
          </ActionButton>

          <Button variant={'ghost'} asChild size={'sm'}>
            <Link href={`/watch/leaderboard`} target="_blank">
              View Leaderboard <ExternalLink className="ml-1 mb-0.5 size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </>
  )
}
