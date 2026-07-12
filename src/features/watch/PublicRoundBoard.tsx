'use client'

import { cn } from '@/lib/utils'
import { Crown, Skull } from 'lucide-react'
import Link from 'next/link'

export const PublicRoundBoard = ({
  rounds,
  numberOfRounds,
}: {
  rounds: Array<{
    roundNo: number
    status: 'won' | 'lost' | null
    matchId: string | null
  }>
  numberOfRounds: number
}) => (
  <div className="grid grid-cols-5 gap-2 rounded-3xl bg-muted/50 p-2">
    {Array.from({ length: numberOfRounds }, (_, roundNo) => {
      const round = rounds.find((candidate) => candidate.roundNo === roundNo)
      const marker = (
        <span
          className={cn(
            'flex size-8 items-center justify-center rounded-full text-white',
            round?.status === 'won'
              ? 'bg-amber-300'
              : round?.status === 'lost'
                ? 'bg-gray-500'
                : 'bg-gray-500/20',
          )}
          aria-label={
            round?.status
              ? `Round ${roundNo + 1}: ${round.status}`
              : `Round ${roundNo + 1}: not played`
          }
        >
          {round?.status === 'won' ? (
            <Crown className="size-5" aria-hidden="true" />
          ) : round?.status === 'lost' ? (
            <Skull className="size-5" aria-hidden="true" />
          ) : null}
        </span>
      )
      return round?.matchId ? (
        <Link
          key={roundNo}
          href={`/match/${round.matchId}`}
          className="flex size-11 touch-manipulation items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {marker}
        </Link>
      ) : (
        <span
          key={roundNo}
          className="flex size-11 items-center justify-center"
        >
          {marker}
        </span>
      )
    })}
  </div>
)
