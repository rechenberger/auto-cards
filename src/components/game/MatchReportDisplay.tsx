import { MatchReport } from '@/game/generateMatch'
import { cn } from '@/lib/utils'
import { capitalCase } from 'change-case'
import { ArrowRight } from 'lucide-react'
import { Fragment } from 'react'
import { StatsDisplay } from './StatsDisplay'

export const MatchReportDisplay = ({
  matchReport,
}: {
  matchReport: MatchReport
}) => {
  return (
    <>
      <div className="grid grid-cols-[auto,auto,auto,1fr,auto] text-xs rounded-md overflow-hidden">
        {matchReport.logs.map((log, idx) => {
          const cell = cn(
            'px-2 py-0.5 flex flex-row items-center h-6',
            log.sideIdx === 0 ? 'bg-blue-500/20' : 'bg-red-500/20',
          )
          const hasStats = !!log.stats
          return (
            <Fragment key={idx}>
              <div className={cn(cell)}>{(log.time / 1000).toFixed(3)}</div>
              <div className={cn(cell, 'flex flex-row gap 1 items-center')}>
                {log.targetSideIdx === undefined ? null : log.sideIdx ===
                  log.targetSideIdx ? null : (
                  <ArrowRight className="size-3" />
                )}
              </div>
              {hasStats && (
                <div className={cn(cell)}>
                  <StatsDisplay stats={log.stats || {}} size="sm" />
                </div>
              )}
              <div className={cn(cell, !hasStats && 'col-span-2')}>
                {log.msg}
              </div>
              <div className={cn(cell)}>
                {log.itemName && <>with {capitalCase(log.itemName)}</>}
              </div>
            </Fragment>
          )
        })}
      </div>
    </>
  )
}
