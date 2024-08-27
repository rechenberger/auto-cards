'use client'

import { useAtom } from 'jotai'
import { useEffect } from 'react'
import {
  activeMatchLogAtom,
  matchPlaybackPlayingAtom,
} from './matchPlaybackState'

export const MatchReportResetter = () => {
  const [activeMatchLog, setActiveMatchLog] = useAtom(activeMatchLogAtom)
  const [playing, setPlaying] = useAtom(matchPlaybackPlayingAtom)

  useEffect(() => {
    setActiveMatchLog(null)
    setPlaying(true)
  }, [setActiveMatchLog, setPlaying])

  return null
}
