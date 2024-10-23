import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { Game, Loadout, MatchParticipation } from '@/db/schema-zod'
import { NO_OF_ROUNDS } from '@/game/config'
import { cn } from '@/lib/utils'
import { eq } from 'drizzle-orm'
import { range } from 'lodash-es'
import { Crown, Skull } from 'lucide-react'
import Link from 'next/link'
import { Fragment } from 'react'

export const GameMatchBoard = async ({
  game,
  showScore,
}: {
  game: Game
  showScore?: boolean
}) => {
  const loadouts = await db.query.loadout.findMany({
    where: eq(schema.loadout.gameId, game.id),
    with: {
      primaryMatchParticipation: true,
    },
  })

  return (
    <>
      <div
        className={cn(
          'grid grid-cols-5 gap-2 p-2 rounded-3xl bg-gray-500/20 self-center',
          // 'md:flex md:flex-row',
        )}
      >
        {range(NO_OF_ROUNDS).map((roundNo) => {
          const loadout = loadouts.find((l) => l.roundNo === roundNo)
          return (
            <Fragment key={roundNo}>
              <GameMatchBoardSingle
                loadout={loadout}
                isActive={roundNo === game.data.roundNo}
                showScore={showScore}
                roundNo={roundNo}
              />
            </Fragment>
          )
        })}
      </div>
    </>
  )
}

export const GameMatchBoardSingle = async ({
  loadout,
  isActive,
  showScore,
  roundNo,
}: {
  loadout?: Loadout & {
    primaryMatchParticipation: MatchParticipation | null
  }
  isActive?: boolean
  showScore?: boolean
  roundNo: number
}) => {
  const status = loadout?.primaryMatchParticipation?.status
  const matchId = loadout?.primaryMatchParticipation?.matchId
  const inner = (
    <div
      className={cn(
        'size-6 md:size-8 rounded-full',
        status === 'won'
          ? 'bg-amber-300'
          : status === 'lost'
            ? 'bg-gray-500'
            : 'bg-gray-500/20',
        'flex items-center justify-center',
        'font-bold leading-none text-center text-sm md:text-lg',
        'text-white',
        isActive && !showScore && 'ring-2 ring-primary',
      )}
    >
      {showScore ? (
        <div className="mt-0.5">
          {status === 'won' ? roundNo + 1 : status === 'lost' ? 0 : null}
        </div>
      ) : (
        <>
          {status === 'won' ? (
            <Crown className="size-4 md:size-6" />
          ) : status === 'lost' ? (
            <Skull className="size-4 md:size-6" />
          ) : isActive ? (
            <div className="mt-0.5">{roundNo + 1}</div>
          ) : null}
        </>
      )}
    </div>
  )
  return (
    <>
      {matchId ? (
        <Link href={`/match/${matchId}`} target="_blank">
          {inner}
        </Link>
      ) : (
        inner
      )}
    </>
  )
}
