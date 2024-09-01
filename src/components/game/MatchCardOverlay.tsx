'use client'

import { hasAnyStats, sumStats } from '@/game/calcStats'
import { MATCH_CARD_ANIMATION_DURATION } from '@/game/config'
import { MatchLog, MatchReport } from '@/game/generateMatch'
import { motion } from 'framer-motion'
import { useAtomValue } from 'jotai'
import { countBy, range, uniqueId } from 'lodash-es'
import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import {
  activeMatchLogAtom,
  matchPlaybackSpeedAtom,
} from './matchPlaybackState'
import { StatsDisplay } from './StatsDisplay'

const useOnLogEvent = ({
  matchReport,
  onLogs,
  onLog,
}: {
  matchReport: MatchReport
  onLogs?: (logs: MatchLog[]) => void
  onLog?: (log: MatchLog) => void
}) => {
  const activeMatchLog = useAtomValue(activeMatchLogAtom)
  const latestLogIdx = useRef<number>(-1)

  useEffect(() => {
    let lastLogIdx = latestLogIdx.current
    if (!activeMatchLog) {
      return
    }
    if (lastLogIdx === activeMatchLog.idx) {
      return
    }
    const newLogIdx = activeMatchLog.idx
    latestLogIdx.current = newLogIdx

    if (newLogIdx < lastLogIdx) {
      lastLogIdx = newLogIdx - 1
    }

    const logIndexesToAnimate = range(lastLogIdx + 1, newLogIdx + 1)

    const logs = logIndexesToAnimate
      .map((idx) => matchReport.logs[idx])
      .filter(Boolean)
    onLogs?.(logs)
    for (const log of logs) {
      onLog?.(log)
    }
  }, [activeMatchLog, matchReport.logs, onLogs, onLog])
}

type AnimationData = {
  id: string
  content: React.ReactNode
  startedAt: number
  duration: number
}

export const MatchCardOverlay = ({
  sideIdx,
  itemIdx,
  matchReport,
}: {
  sideIdx: number
  itemIdx: number
  matchReport: MatchReport
}) => {
  const [animations, setAnimations] = useState<AnimationData[]>([])

  const speed = useAtomValue(matchPlaybackSpeedAtom)
  const activeMatchLog = useAtomValue(activeMatchLogAtom)
  const stats =
    activeMatchLog?.log.stateSnapshot.sides[sideIdx].items[itemIdx].statsItem

  const addAnimation = useCallback(
    (animation: Omit<AnimationData, 'startedAt' | 'duration' | 'id'>) => {
      setAnimations((animations) => [
        ...animations.filter((a) => Date.now() - a.startedAt < a.duration),
        {
          ...animation,
          id: uniqueId(),
          startedAt: Date.now(),
          duration: MATCH_CARD_ANIMATION_DURATION / speed,
        },
      ])
    },
    [speed],
  )

  useOnLogEvent({
    matchReport,
    onLogs: (logs) => {
      logs = logs.filter(
        (log) => log.sideIdx === sideIdx && log.itemIdx === itemIdx,
      )
      const statsMySide = sumStats(
        ...logs
          .filter((log) => log.targetSideIdx === sideIdx)
          .map((log) => log.stats || {}),
      )
      const statsOtherSide = sumStats(
        ...logs
          .filter((log) => log.targetSideIdx !== sideIdx)
          .map((log) => log.stats || {}),
      )

      for (const stats of [statsMySide, statsOtherSide]) {
        if (hasAnyStats({ stats })) {
          addAnimation({
            content: <StatsDisplay stats={stats} size="sm" />,
          })
        }
      }

      const messagesWithoutStats = logs
        .filter((log) => !log.stats)
        .map((log) => log.msg)
      const msgCounts = countBy(messagesWithoutStats, (msg) => msg)

      for (const [msg, count] of Object.entries(msgCounts)) {
        if (count > 1) {
          addAnimation({
            content: (
              <div className="text-xs">
                {count > 1 ? `${count}x ` : ''}
                {msg}
              </div>
            ),
          })
        }
      }
    },
    // onLog: (log) => {
    //   if (log.sideIdx !== sideIdx) return
    //   if (log.itemIdx !== itemIdx) return

    //   addAnimation({
    //     content: (
    //       <>
    //         {log.stats ? (
    //           <StatsDisplay stats={log.stats} size="sm" />
    //         ) : (
    //           <div className="text-xs">{log.msg}</div>
    //         )}
    //       </>
    //     ),
    //   })
    // },
  })

  return (
    <>
      {stats && (
        <div className="absolute top-4 inset-x-2 flex items-center justify-center">
          <StatsDisplay stats={stats} size="sm" />
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col gap-2">
        {animations.map((animation) => {
          return (
            <Fragment key={animation.id}>
              <Animation {...animation} />
            </Fragment>
          )
        })}
      </div>
    </>
  )
}

const Animation = ({
  content,
  duration,
  startedAt,
}: {
  id: string
  content: React.ReactNode
  startedAt: number
  duration: number
}) => {
  if (Date.now() - startedAt > duration) {
    return null
  }
  return (
    <motion.div
      // className="absolute bottom-0"
      // initial={{ opacity: 1 }}
      animate={{ opacity: 0, y: -100 }}
      transition={{
        duration: duration / 1000,
      }}
    >
      {content}
    </motion.div>
  )
}
