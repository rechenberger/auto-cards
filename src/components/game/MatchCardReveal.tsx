'use client'

import { motion } from 'framer-motion'
import { useAtomValue } from 'jotai'
import { activeMatchLogAtom } from './matchPlaybackState'
import { useMatchTime } from './useMatchTime'

export const MatchCardReveal = ({
  sideIdx,
  itemIdx,
}: {
  sideIdx: number
  itemIdx: number
}) => {
  const activeMatchLog = useAtomValue(activeMatchLogAtom)

  // const [speed] = useAtom(matchPlaybackSpeedAtom)
  // const isPlaying = useAtomValue(matchPlaybackPlayingAtom)

  const item = activeMatchLog?.log.stateSnapshot.sides[sideIdx].items[itemIdx]
  const time = useMatchTime()

  const isRevealed = item && time >= item.revealsAt

  if (isRevealed) {
    return null
  }

  return (
    <motion.div className="absolute inset-0 bg-black pointer-events-none z-10" />
  )
}
