'use client'

import { useAtomValue } from 'jotai'
import { activeMatchLogAtom } from './matchPlaybackState'
import { StatsBars } from './StatsBars'
import { StatsDisplay } from './StatsDisplay'

export const MatchStatsDisplay = ({ sideIdx }: { sideIdx: number }) => {
  const activeMatchLog = useAtomValue(activeMatchLogAtom)
  if (!activeMatchLog) return null

  const stats = activeMatchLog.log.stateSnapshot.sides[sideIdx].stats

  return (
    <>
      <StatsBars stats={stats} />
      <StatsDisplay stats={stats} size="sm" />
    </>
  )
}
