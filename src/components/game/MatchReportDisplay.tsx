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
      <div className="grid grid-cols-[auto,auto,auto,1fr,auto] border text-xs rounded">
        {matchReport.logs.map((log, idx) => {
          const cell = 'border px-2 py-0.5 flex flex-row items-center'
          const hasStats = !!log.stats
          return (
            <Fragment key={idx}>
              <div className={cn(cell)}>{(log.time / 1000).toFixed(3)}</div>
              <div className={cn(cell, 'flex flex-row gap 1 items-center')}>
                <div>{log.sideIdx}</div>
                <>
                  <ArrowRight className="size-3" />
                  <div>{log.targetSideIdx}</div>
                </>
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
