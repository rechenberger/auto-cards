import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { Game } from '@/db/schema-zod'
import { MAX_ROUND_NO } from '@/game/config'
import { cn } from '@/lib/utils'
import { eq } from 'drizzle-orm'
import { range } from 'lodash-es'
import { Crown, Skull } from 'lucide-react'
import Link from 'next/link'
import { Fragment } from 'react'

export const GameMatchBoard = async ({ game }: { game: Game }) => {
  const loadouts = await db.query.loadout.findMany({
    where: eq(schema.loadout.gameId, game.id),
    with: {
      primaryMatchParticipation: {
        with: {
          match: true,
        },
      },
    },
  })

  return (
    <>
      <div className="flex flex-row gap-2 p-2 rounded-full bg-gray-500/20 self-center">
        {range(MAX_ROUND_NO).map((roundNo) => {
          const loadout = loadouts.find((l) => l.roundNo === roundNo)
          const status = loadout?.primaryMatchParticipation?.status
          const match = loadout?.primaryMatchParticipation?.match
          const inner = (
            <div
              className={cn(
                'size-8 rounded-full',
                status === 'won'
                  ? 'bg-amber-300'
                  : status === 'lost'
                    ? 'bg-gray-500'
                    : 'bg-gray-500/20',
                'flex items-center justify-center',
                'text-white',
              )}
            >
              {status === 'won' ? (
                <Crown className="size-6" />
              ) : status === 'lost' ? (
                <Skull className="size-6" />
              ) : roundNo === game.data.roundNo ? (
                roundNo + 1
              ) : null}
            </div>
          )
          return (
            <Fragment key={roundNo}>
              {match ? (
                <Link href={`/match/${match?.id}`} target="_blank">
                  {inner}
                </Link>
              ) : (
                inner
              )}
            </Fragment>
          )
        })}
      </div>
    </>
  )
}
