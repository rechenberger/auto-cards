'use client'

import { MatchReport } from '@/game/generateMatch'
import { cn } from '@/lib/utils'
import { useAtomValue } from 'jotai'
import { activeMatchLogAtom } from './matchPlaybackState'
import { StatsBars } from './StatsBars'
import { StatsDisplay } from './StatsDisplay'

export const MatchStatsDisplay = ({
  matchReport,
  sideIdx,
}: {
  matchReport: MatchReport
  sideIdx: number
}) => {
  let activeMatchLog = useAtomValue(activeMatchLogAtom)
  if (!activeMatchLog) {
    activeMatchLog = {
      idx: 0,
      log: matchReport.logs[0],
    }
  }

  const stats = activeMatchLog.log.stateSnapshot.sides[sideIdx].stats

  return (
    <>
      <StatsBars stats={stats} />
      <div className="min-h-28">
        <StatsDisplay
          stats={stats}
          size="sm"
          hideBars
          canWrap
          className={cn(
            sideIdx === 0 ? 'justify-start' : 'justify-end',
            'grid grid-cols-3 md:grid-cols-4 items-start',
          )}
        />
      </div>
    </>
  )
}
