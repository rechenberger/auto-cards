'use client'

import { MatchReport } from '@/game/generateMatch'
import { useAtom } from 'jotai'
import { Pause, Play, RotateCcw } from 'lucide-react'
import { Fragment, useEffect } from 'react'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import {
  activeMatchLogAtom,
  matchPlaybackPlayingAtom,
  matchPlaybackSpeedAtom,
} from './matchPlaybackState'

const MIN_TIMEOUT = 100

const speeds = [0.5, 1, 2, 4]

export const MatchReportPlaybackControls = ({
  matchReport,
}: {
  matchReport: MatchReport
}) => {
  const [activeMatchLog, setActiveMatchLog] = useAtom(activeMatchLogAtom)
  const [speed, setSpeed] = useAtom(matchPlaybackSpeedAtom)
  const [playing, setPlaying] = useAtom(matchPlaybackPlayingAtom)

  const isDone = activeMatchLog?.idx === matchReport.logs.length - 1

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

    let ms = nextLogTime - activeLogTime
    ms /= speed
    if (ms < MIN_TIMEOUT) {
      ms = MIN_TIMEOUT
    }

    const timeout = setTimeout(() => {
      setActiveMatchLog({ idx: nextLogIdx, log: nextLog })
    }, ms)

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
      <div className="flex flex-row">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            if (!playing && isDone) {
              setActiveMatchLog({ idx: 0, log: matchReport.logs[0] })
            }
            setPlaying((p) => !p)
          }}
          className="flex flex-row gap-2 items-center rounded-r-none"
        >
          {playing ? (
            <>
              <Pause className="size-4" />
              <span>Pause</span>
            </>
          ) : isDone ? (
            <>
              <RotateCcw className="size-4" />
              <span>Replay</span>
            </>
          ) : (
            <>
              <Play className="size-4" />
              <span>Play</span>
            </>
          )}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="sm"
              className="flex flex-row gap-1 items-center rounded-l-none"
            >
              {speed}x
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {speeds.map((s) => (
              <Fragment key={s}>
                <DropdownMenuItem
                  onSelect={() => {
                    setSpeed(s)
                  }}
                >
                  {s}x
                </DropdownMenuItem>
              </Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  )
}
