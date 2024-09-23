import { BATTLE_CLOCK_TICK_MS } from '@/game/config'
import { useAtomValue } from 'jotai'
import { useEffect, useState } from 'react'
import {
  activeMatchLogAtom,
  matchPlaybackPlayingAtom,
} from './matchPlaybackState'

export const useMatchTime = () => {
  const [time, setTime] = useState(0)
  const isPlaying = useAtomValue(matchPlaybackPlayingAtom)
  const activeLog = useAtomValue(activeMatchLogAtom)

  useEffect(() => {
    let t = activeLog?.log.time ?? 0
    setTime(t)

    if (!isPlaying) return

    const interval = setInterval(() => {
      t += BATTLE_CLOCK_TICK_MS
      setTime(t)
    }, BATTLE_CLOCK_TICK_MS)

    return () => clearInterval(interval)
  }, [isPlaying, activeLog])

  return time
}
