'use client'

import { MatchReplayParticipantDto } from '@/contracts/replay'
import { cn } from '@/lib/utils'
import { useAtomValue } from 'jotai'
import { Crown } from 'lucide-react'
import { activeMatchLogAtom } from './matchPlaybackState'
import { useMatchReport } from './MatchReportProvider'
import { MatchStatsDisplay } from './MatchStatsDisplay'

export const MatchReplaySide = ({
  participant,
}: {
  participant: MatchReplayParticipantDto
}) => {
  const matchReport = useMatchReport()
  const sideIdx = participant.sideIdx
  const isEnemy = sideIdx === 1
  const isWinner = matchReport.winner.sideIdx === sideIdx
  const activeMatchLog = useAtomValue(activeMatchLogAtom)
  const isDone = activeMatchLog?.idx === matchReport.logs.length - 1

  return (
    <div
      className={cn(
        'flex flex-row gap-4 justify-start',
        isEnemy && 'flex-row-reverse',
        'xl:w-80 min-h-48 p-4 rounded-xl relative',
        isEnemy ? 'bg-red-500/20' : 'bg-blue-500/20',
      )}
    >
      {isDone && isWinner && (
        <div
          className={cn(
            'absolute -top-6 xl:-top-12',
            isEnemy ? 'right-2' : 'left-2',
          )}
        >
          <Crown className="size-8 xl:size-16" />
        </div>
      )}
      <div
        className={cn(
          'flex flex-col gap-2 overflow-hidden',
          isEnemy ? 'items-end' : 'items-start',
        )}
      >
        <div className="text-lg font-bold truncate max-w-28 sm:max-w-60">
          {participant.displayName}
        </div>
        <MatchStatsDisplay matchReport={matchReport} sideIdx={sideIdx} />
      </div>
    </div>
  )
}
