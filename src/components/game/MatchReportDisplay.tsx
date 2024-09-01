'use client'

import { MatchReport } from '@/game/generateMatch'
import { cn } from '@/lib/utils'
import { capitalCase } from 'change-case'
import { useAtom } from 'jotai'
import { keys, pick, pickBy } from 'lodash-es'
import { ArrowRight, Swords } from 'lucide-react'
import { Fragment } from 'react'
import { SimpleScrollIntoView } from '../simple/SimpleScrollIntoView'
import {
  activeMatchLogAtom,
  matchPlaybackPlayingAtom,
} from './matchPlaybackState'
import { StatsDisplay } from './StatsDisplay'

export const MatchReportDisplay = ({
  matchReport,
}: {
  matchReport: MatchReport
}) => {
  const [activeMatchLog, setActiveMatchLog] = useAtom(activeMatchLogAtom)
  const [isPlaying, setIsPlaying] = useAtom(matchPlaybackPlayingAtom)

  return (
    <>
      <div className="grid grid-cols-[auto,auto,auto,1fr,auto,auto] text-xs rounded-md whitespace-nowrap relative">
        {matchReport.logs.map((log, idx) => {
          const isActive = activeMatchLog?.idx === idx

          const cell = cn(
            'px-2 py-0.5 flex flex-row items-center h-8',
            'transition-colors duration-100 ease-in-out',
            log.sideIdx === 0 ? 'bg-blue-500' : 'bg-red-500',
            isActive ? 'bg-opacity-50' : 'bg-opacity-20',
            isPlaying && 'cursor-pointer',
          )
          const hasStats = !!log.stats

          const statsAfterItem =
            log.targetSideIdx !== undefined &&
            log.targetItemIdx !== undefined &&
            log.stats &&
            pick(
              log.stateSnapshot.sides[log.targetSideIdx].items[
                log.targetItemIdx
              ].statsItem,
              keys(pickBy(log.stats, (v) => !!v)),
            )

          const statsAfter =
            statsAfterItem ||
            (log.targetSideIdx !== undefined &&
              log.stats &&
              pick(
                log.stateSnapshot.sides[log.targetSideIdx].stats,
                keys(pickBy(log.stats, (v) => !!v)),
              ))

          const cellProps = {
            onClick: () => {
              setIsPlaying(false)
              setActiveMatchLog({ idx, log })
            },
            onMouseEnter: () => {
              if (isPlaying) {
                return
              }
              setActiveMatchLog({ idx, log })
            },
            // onMouseLeave: () => setActiveMatchLog(null),
          }
          return (
            <Fragment key={idx}>
              <div {...cellProps} className={cn(cell, 'justify-end')}>
                {(log.time / 1000).toFixed(1)}s
                {isActive && isPlaying && <SimpleScrollIntoView />}
              </div>
              <div
                {...cellProps}
                className={cn(cell, 'flex flex-row gap 1 items-center')}
              >
                {log.targetSideIdx !== undefined &&
                  log.sideIdx !== log.targetSideIdx && (
                    <Swords className="size-3" />
                  )}
              </div>
              {hasStats && (
                <div {...cellProps} className={cn(cell)}>
                  <StatsDisplay stats={log.stats || {}} size="sm" />
                </div>
              )}
              <div
                {...cellProps}
                className={cn(cell, !hasStats && 'col-span-2')}
              >
                {log.msg}
              </div>
              <div {...cellProps} className={cn(cell)}>
                {log.itemName && <>with {capitalCase(log.itemName)}</>}
              </div>
              <div {...cellProps} className={cn(cell, 'flex flex-row gap-2')}>
                {statsAfter && (
                  <>
                    <ArrowRight className="size-3" />
                    <StatsDisplay stats={statsAfter} size="sm" showZero />
                  </>
                )}
              </div>
            </Fragment>
          )
        })}
      </div>
    </>
  )
}
