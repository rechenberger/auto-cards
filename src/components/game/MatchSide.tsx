'use client'

import { getBotName } from '@/game/botName'
import { MatchReport } from '@/game/generateMatch'
import { cn } from '@/lib/utils'
import { useAtomValue } from 'jotai'
import { Crown } from 'lucide-react'
import { MatchParticipant } from './MatchParticipants'
import { activeMatchLogAtom } from './matchPlaybackState'
import { MatchStatsDisplay } from './MatchStatsDisplay'

export const MatchSide = ({
  sideIdx,
  participant,
  matchReport,
}: {
  sideIdx: number
  participant: MatchParticipant
  matchReport: MatchReport
}) => {
  const isEnemy = sideIdx === 1
  const name =
    participant.user?.name ||
    participant.user?.email ||
    getBotName({ seed: participant.loadout.id })

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
            className={cn('absolute -top-12', isEnemy ? 'right-2' : 'left-2')}
          >
            <Crown className="size-16" />
          </div>
        )}
        <div
          className={cn(
            'flex flex-col gap-2',
            isEnemy ? 'items-end' : 'items-start',
          )}
        >
          <div className="text-lg font-bold">{name}</div>
          <MatchStatsDisplay matchReport={matchReport} sideIdx={sideIdx} />
        </div>
        {/* <MatchCards items={participant.loadout.data.items} /> */}
      </div>
    </>
  )
}
