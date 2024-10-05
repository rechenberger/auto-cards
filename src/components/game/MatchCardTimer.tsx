'use client'

import { BATTLE_CLOCK_TICK_MS } from '@/game/config'
import { FutureActionItem } from '@/game/generateMatch'
import { motion } from 'framer-motion'
import { useAtom, useAtomValue } from 'jotai'
import { useEffect, useState } from 'react'
import {
  activeMatchLogAtom,
  matchPlaybackPlayingAtom,
  matchPlaybackSpeedAtom,
} from './matchPlaybackState'

export const MatchCardTimer = ({
  sideIdx,
  itemIdx,
}: {
  sideIdx: number
  itemIdx: number
}) => {
  const activeMatchLog = useAtomValue(activeMatchLogAtom)

  const [speed] = useAtom(matchPlaybackSpeedAtom)
  const isPlaying = useAtomValue(matchPlaybackPlayingAtom)

  const futureActions = activeMatchLog?.log.stateSnapshot.futureActions

  const [progress, setProgress] = useState(0)

  const nextItemActivation = futureActions?.find(
    (fai) =>
      fai.type === 'interval' &&
      fai.itemIdx === itemIdx &&
      fai.sideIdx === sideIdx &&
      !!fai.currentCooldown,
  ) as FutureActionItem | undefined

  const cooldown = (nextItemActivation as any)?.currentCooldown ?? 0

  useEffect(() => {
    if (!isPlaying && nextItemActivation?.lastUsed) {
      setProgress(
        (activeMatchLog?.log.time ?? 0) - (nextItemActivation?.lastUsed ?? 0),
      )
    }
    if (isPlaying && activeMatchLog?.log.time === 0) {
      setProgress(0)
    }
  }, [activeMatchLog?.log.time, isPlaying, nextItemActivation?.lastUsed])

  const tick = BATTLE_CLOCK_TICK_MS / speed
  useEffect(() => {
    if (!isPlaying || !cooldown) return

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + BATTLE_CLOCK_TICK_MS
        return newProgress < cooldown ? newProgress : 0
      })
    }, tick)

    return () => clearInterval(interval)
  }, [isPlaying, cooldown, tick])

  if (!futureActions || !nextItemActivation?.active) return null

  const newHeight = (progress / cooldown) * 100

  return (
    <motion.div
      className="absolute bottom-0 right-0 left-0 bg-gray-500/40 pointer-events-none"
      initial={{ height: '0%' }}
      animate={{ height: `${Math.min(newHeight, 100)}%` }}
      transition={{ duration: tick / 1000, ease: 'linear' }}
    />
  )
}
