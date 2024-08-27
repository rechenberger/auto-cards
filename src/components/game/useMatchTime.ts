import { useAtomValue } from 'jotai'
import { useEffect, useState } from 'react'
import {
  activeMatchLogAtom,
  matchPlaybackPlayingAtom,
} from './matchPlaybackState'

const tick = 100

export const useMatchTime = () => {
  const [time, setTime] = useState(0)
  const isPlaying = useAtomValue(matchPlaybackPlayingAtom)
  const activeLog = useAtomValue(activeMatchLogAtom)

  useEffect(() => {
    let t = activeLog?.log.time ?? 0
    setTime(t)

    if (!isPlaying) return

    const interval = setInterval(() => {
      t += tick
      setTime(t)
    }, tick)

    return () => clearInterval(interval)
  }, [isPlaying, activeLog])

  return time
}
