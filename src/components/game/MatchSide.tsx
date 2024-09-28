'use client'

import { getBotName } from '@/game/botName'
import { getUserName } from '@/game/getUserName'
import { cn } from '@/lib/utils'
import { useAtomValue } from 'jotai'
import { Crown } from 'lucide-react'
import { MatchParticipant } from './MatchParticipants'
import { activeMatchLogAtom } from './matchPlaybackState'
import { useMatchReport } from './MatchReportProvider'
import { MatchStatsDisplay } from './MatchStatsDisplay'

export const MatchSide = ({
  sideIdx,
  participant,
}: {
  sideIdx: number
  participant: MatchParticipant
}) => {
  const matchReport = useMatchReport()
  const isEnemy = sideIdx === 1
  const name = participant.user
    ? getUserName({ user: participant.user })
    : getBotName({ seed: participant.loadout.id })

  const isWinner = matchReport.winner.sideIdx === sideIdx
  const activeMatchLog = useAtomValue(activeMatchLogAtom)
  const isDone = activeMatchLog?.idx === matchReport.logs.length - 1

  return (
    <>
      <div
        className={cn(
          'flex flex-row gap-4 justify-start',
          isEnemy && 'flex-row-reverse',
          'xl:w-80 min-h-48',
          'p-4 rounded-xl',
          isEnemy ? 'bg-red-500/20' : 'bg-blue-500/20',
          'relative',
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
            'flex flex-col gap-2',
            isEnemy ? 'items-end' : 'items-start',
            'overflow-hidden',
          )}
        >
          <div className="text-lg font-bold truncate max-w-28 sm:max-w-60">
            {name}
          </div>
          <MatchStatsDisplay matchReport={matchReport} sideIdx={sideIdx} />
        </div>
        {/* <MatchCards items={participant.loadout.data.items} /> */}
      </div>
    </>
  )
}
