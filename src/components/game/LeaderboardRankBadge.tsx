'use client'

import { Button } from '@/components/ui/button'
import { GREAT_WIN_RATE, LEADERBOARD_LIMIT } from '@/game/rules'
import { getOrdinalSuffix } from '@/lib/getOrdinalSuffix'
import { cn } from '@/lib/utils'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'

export type LeaderboardRankSummary = {
  rank: number
  score: number
  isTop: boolean
}

const rankColors = (summary: LeaderboardRankSummary) => {
  const great = summary.score >= GREAT_WIN_RATE
  const textColor =
    summary.rank <= 3
      ? 'text-black'
      : summary.isTop
        ? 'text-amber-300'
        : great
          ? 'text-green-500'
          : 'text-gray-500'
  const borderColor = summary.isTop
    ? 'border-amber-300'
    : great
      ? 'border-green-500'
      : 'border-gray-500'
  const podium = cn(
    summary.rank === 1 &&
      'bg-gradient-to-bl from-amber-100 to-amber-500 text-black',
    summary.rank === 2 &&
      'border-gray-300 bg-gradient-to-bl from-gray-100 to-gray-500 text-black',
    summary.rank === 3 &&
      'border-orange-300 bg-gradient-to-bl from-orange-100 to-orange-500 text-black',
  )
  return { great, textColor, borderColor, podium }
}

export const LeaderboardRankBadge = ({
  summary,
  tiny = false,
}: {
  summary: LeaderboardRankSummary
  tiny?: boolean
}) => {
  const { great, textColor, borderColor, podium } = rankColors(summary)

  if (tiny) {
    return (
      <div
        className={cn(
          'flex w-24 flex-col items-center justify-center rounded-md border-2 px-2 py-1',
          textColor,
          borderColor,
          podium,
        )}
      >
        {summary.isTop ? (
          <div className="font-sans text-4xl font-bold tabular-nums">
            {summary.rank}
            <span className="ordinal">{getOrdinalSuffix(summary.rank)}</span>
          </div>
        ) : great ? (
          <div className="font-sans text-xl font-bold">GREAT</div>
        ) : null}
        <div className="font-sans tabular-nums">
          {summary.score.toFixed(2)}%
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-lg bg-background/80 p-4',
        summary.isTop && 'border-2 border-amber-300',
        podium,
      )}
    >
      {great && (
        <div className={cn('text-xl font-bold', textColor)}>
          {summary.isTop ? 'Awesome!' : 'Great!'}
        </div>
      )}
      <div className="flex flex-col items-center gap-1">
        <div className="text-xs">Your cards have a win-rate of</div>
        <div
          className={cn('font-sans text-xl font-bold tabular-nums', textColor)}
        >
          {summary.score.toFixed(2)}%
        </div>
        <div className="text-xs">
          against the <strong>Top {LEADERBOARD_LIMIT}</strong> Leaderboard.
        </div>
      </div>
      {summary.isTop && (
        <div className="flex flex-col items-center gap-1">
          <div className="text-xs">Making this the</div>
          <div
            className={cn(
              'font-sans text-4xl font-bold tabular-nums',
              textColor,
            )}
          >
            {summary.rank}
            <span className="ordinal">{getOrdinalSuffix(summary.rank)}</span>
          </div>
          <div className="text-xs font-bold">Best Build in the World.</div>
        </div>
      )}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/watch/leaderboard" target="_blank">
          View Leaderboard
          <ExternalLink className="ml-1 size-4" aria-hidden="true" />
        </Link>
      </Button>
    </div>
  )
}
