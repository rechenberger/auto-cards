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
  <div className="grid grid-cols-5 gap-2 rounded-3xl bg-gray-500/20 p-2 self-center">
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
              'size-8 rounded-full flex items-center justify-center',
              'font-bold leading-none text-center text-lg text-white',
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
              status === 'won' ? (
                roundNo + 1
              ) : status === 'lost' ? (
                0
              ) : null
            ) : status === 'won' ? (
              <Crown className="size-5" aria-hidden="true" />
            ) : status === 'lost' ? (
              <Skull className="size-5" aria-hidden="true" />
            ) : roundNo === view.game.data.roundNo ? (
              roundNo + 1
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
            className="flex size-11 touch-manipulation items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {inner}
          </Link>
        ) : (
          <div
            key={roundNo}
            className="flex size-11 items-center justify-center"
          >
            {inner}
          </div>
        )
      },
    )}
  </div>
)
