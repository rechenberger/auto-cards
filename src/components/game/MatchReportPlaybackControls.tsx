'use client'

import { MatchReport } from '@/game/generateMatch'
import { useAtom } from 'jotai'
import { useEffect } from 'react'
import { Button } from '../ui/button'
import {
  activeMatchLogAtom,
  matchPlaybackPlayingAtom,
  matchPlaybackSpeedAtom,
} from './matchPlaybackState'

export const MatchReportPlaybackControls = ({
  matchReport,
}: {
  matchReport: MatchReport
}) => {
  const [activeMatchLog, setActiveMatchLog] = useAtom(activeMatchLogAtom)
  const [speed, setSpeed] = useAtom(matchPlaybackSpeedAtom)
  const [playing, setPlaying] = useAtom(matchPlaybackPlayingAtom)

  useEffect(() => {
    if (!playing) return

    const activeLogIdx = activeMatchLog?.idx ?? -1
    const activeLogTime = activeMatchLog?.log.time ?? 0

    const nextLogIdx = activeLogIdx + 1

    if (nextLogIdx >= matchReport.logs.length) {
      setPlaying(false)
      return
    }

    const nextLog = matchReport.logs[nextLogIdx]
    const nextLogTime = nextLog.time

    const timeout = setTimeout(() => {
      setActiveMatchLog({ idx: nextLogIdx, log: nextLog })
    }, nextLogTime - activeLogTime)

    return () => clearTimeout(timeout)
  }, [
    playing,
    speed,
    activeMatchLog,
    setActiveMatchLog,
    matchReport.logs,
    setPlaying,
  ])

  return (
    <>
      <div className="flex flex-row gap-2">
        <Button onClick={() => setPlaying((p) => !p)}>
          {playing ? 'Pause' : 'Play'}
        </Button>
      </div>
    </>
  )
}
