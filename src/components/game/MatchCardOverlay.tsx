'use client'

import { MatchLog, MatchReport } from '@/game/generateMatch'
import { motion } from 'framer-motion'
import { useAtomValue } from 'jotai'
import { range } from 'lodash-es'
import { Fragment, useEffect, useRef, useState } from 'react'
import { activeMatchLogAtom } from './matchPlaybackState'
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

    const logs = logIndexesToAnimate.map((idx) => matchReport.logs[idx])
    onLogs?.(logs)
    for (const log of logs) {
      onLog?.(log)
    }
  }, [activeMatchLog, matchReport.logs, onLogs, onLog])
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
  const [animations, setAnimations] = useState<
    {
      id: string
      content: React.ReactNode
      startedAt: number
      duration: number
    }[]
  >([])

  useOnLogEvent({
    matchReport,
    onLog: (log) => {
      if (log.sideIdx !== sideIdx) return
      if (log.itemIdx !== itemIdx) return

      setAnimations((animations) => [
        ...animations,
        {
          id: log.logIdx.toString(),
          content: <>{log.stats && <StatsDisplay stats={log.stats} />}</>,
          startedAt: Date.now(),
          duration: 1000,
        },
      ])

      // toast({
      //   title: 'Item used',
      //   description: log.itemName,
      // })
    },
  })

  return (
    <>
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
