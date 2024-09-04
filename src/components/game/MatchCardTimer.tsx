'use client'

import { MatchReport } from '@/game/generateMatch'
import { useAtomValue } from 'jotai'
import { minBy } from 'lodash-es'
import { useRef } from 'react'
import { activeMatchLogAtom } from './matchPlaybackState'

export const MatchCardTimer = ({
  sideIdx,
  itemIdx,
  matchReport,
}: {
  sideIdx: number
  itemIdx: number
  matchReport: MatchReport
}) => {
  const currentPercent = useRef(0)
  const activeMatchLog = useAtomValue(activeMatchLogAtom)
  const nextItemActivation =
    activeMatchLog?.log.stateSnapshot.futureActions.find(
      (fa) =>
        fa.type === 'itemTrigger' &&
        fa.itemIdx === itemIdx &&
        fa.sideIdx === sideIdx,
    )
  const currentTime = activeMatchLog?.log.time

  const timeTillNextUpdate = minBy(
    activeMatchLog?.log.stateSnapshot.futureActions,
    (fa) => fa.time,
  )?.time

  if (
    !nextItemActivation ||
    !currentTime ||
    nextItemActivation.type !== 'itemTrigger'
  )
    return <></>

  const { time: timeToUseItemAgain, lastUsed } = nextItemActivation

  const cooldown = timeToUseItemAgain - lastUsed

  const cooldownProgressPercent =
    cooldown > 0
      ? Math.floor(Math.min(100, ((currentTime - lastUsed) / cooldown) * 100))
      : 0

  currentPercent.current = cooldownProgressPercent

  const animationDuration = timeTillNextUpdate
    ? timeTillNextUpdate - currentTime
    : 0

  console.log({ timeTillNextUpdate, currentTime, animationDuration })

  return (
    <div
      className="absolute scale-105 bottom-1 left-0 right-0 bg-gray-500 bg-opacity-50 transition-all"
      style={{
        height: `${cooldownProgressPercent}%`,
        transitionDuration: `${animationDuration}ms`,
      }}
    ></div>
  )
}
