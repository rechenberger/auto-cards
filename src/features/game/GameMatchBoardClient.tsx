'use client'

import { GameViewDto } from '@/contracts/game-api'
import { getNumberOfRounds } from '@/game/gameVersion'
import { cn } from '@/lib/utils'
import { Crown, Skull } from 'lucide-react'
import Link from 'next/link'

export const GameMatchBoardClient = ({
  view,
  showScore,
}: {
  view: GameViewDto
  showScore?: boolean
}) => (
  <div className="grid grid-cols-5 gap-2 self-center rounded-3xl bg-gray-500/20 p-2">
    {Array.from(
      { length: getNumberOfRounds(view.game.version) },
      (_, roundNo) => {
        const round = view.rounds.find(
          (candidate) => candidate.roundNo === roundNo,
        )
        const status = round?.status
        const inner = (
          <div
            className={cn(
              'flex size-6 items-center justify-center rounded-full md:size-8',
              'text-center text-sm font-bold leading-none text-white md:text-lg',
              status === 'won'
                ? 'bg-amber-300'
                : status === 'lost'
                  ? 'bg-gray-500'
                  : 'bg-gray-500/20',
              roundNo === view.game.data.roundNo &&
                !showScore &&
                'ring-2 ring-primary',
            )}
            aria-label={
              status
                ? `Round ${roundNo + 1}: ${status}`
                : `Round ${roundNo + 1}`
            }
          >
            {showScore ? (
              <div className="mt-0.5">
                {status === 'won' ? roundNo + 1 : status === 'lost' ? 0 : null}
              </div>
            ) : status === 'won' ? (
              <Crown className="size-4 md:size-6" aria-hidden="true" />
            ) : status === 'lost' ? (
              <Skull className="size-4 md:size-6" aria-hidden="true" />
            ) : roundNo === view.game.data.roundNo ? (
              <div className="mt-0.5">{roundNo + 1}</div>
            ) : null}
          </div>
        )

        return round?.matchId ? (
          <Link
            key={roundNo}
            href={`/match/${round.matchId}`}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open replay for round ${roundNo + 1}`}
            className="relative block touch-manipulation rounded-full after:absolute after:-inset-2 after:rounded-full after:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {inner}
          </Link>
        ) : (
          <div key={roundNo}>{inner}</div>
        )
      },
    )}
  </div>
)
