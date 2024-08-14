import { MatchReport } from '@/game/generateMatch'
import { capitalCase } from 'change-case'
import { map, omitBy } from 'lodash-es'
import { ArrowRight } from 'lucide-react'
import { Fragment } from 'react'

export const MatchReportDisplay = ({
  matchReport,
}: {
  matchReport: MatchReport
}) => {
  return (
    <>
      <div className="flex flex-col text-xs">
        {matchReport.logs.map((log, idx) => (
          <Fragment key={idx}>
            <div className="flex flex-row gap-1">
              <div className="flex flex-row gap-0">
                <div>{log.sideIdx}</div>
                <>
                  <ArrowRight className="size-3" />
                  <div>{log.targetSideIdx}</div>
                </>
              </div>
              <div>{log.msg}</div>
              <div>
                {map(
                  omitBy(log.stats, (s) => !s),
                  (v, k) => `${v} ${capitalCase(k)}`,
                ).join(', ')}
              </div>
            </div>
          </Fragment>
        ))}
      </div>
    </>
  )
}
