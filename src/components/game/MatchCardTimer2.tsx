'use client'

import { MatchReport } from '@/game/generateMatch'
import { motion } from 'framer-motion'
import { useAtom, useAtomValue } from 'jotai'
import { useEffect, useState } from 'react'
import {
  activeMatchLogAtom,
  matchPlaybackPlayingAtom,
  matchPlaybackSpeedAtom,
} from './matchPlaybackState'

export const MatchCardTimer2 = ({
  sideIdx,
  itemIdx,
  matchReport,
}: {
  sideIdx: number
  itemIdx: number
  matchReport: MatchReport
}) => {
  // const [currentPercent, setCurrentPercent] = useState(0)
  const activeMatchLog = useAtomValue(activeMatchLogAtom)

  const [speed, setSpeed] = useAtom(matchPlaybackSpeedAtom)
  const isPlaying = useAtomValue(matchPlaybackPlayingAtom)

  const futureActions = activeMatchLog?.log.stateSnapshot.futureActions

  const [progress, setProgress] = useState(0)

  const nextItemActivation: any = futureActions?.find(
    (fai) =>
      fai.type === 'interval' &&
      fai.itemIdx === itemIdx &&
      fai.sideIdx === sideIdx &&
      !!fai.currentCooldown,
  )

  // if(nextItemActivation?.type !== 'interval') return <></>

  const cooldown = (nextItemActivation as any)?.currentCooldown ?? 0

  useEffect(() => {
    // console.log({ time: activeMatchLog?.log.time })
    if (!isPlaying && nextItemActivation?.lastUsed) {
      console.log({
        time: activeMatchLog?.log.time,
        lastUsed: nextItemActivation?.lastUsed,
      })

      setProgress(
        (activeMatchLog?.log.time ?? 0) - (nextItemActivation?.lastUsed ?? 0),
      )
    }
  }, [activeMatchLog?.log.time, isPlaying, nextItemActivation?.lastUsed])

  const tick = 100 / speed
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 100
        return newProgress < cooldown ? newProgress : 0
      })
    }, tick)

    return () => clearInterval(interval)
  }, [isPlaying, cooldown, tick])

  if (!futureActions) return <></>

  // const currentTime = activeMatchLog?.log.time

  // const relevantLogsForNextUpdate = futureActions.filter((fa) => {
  //   return (
  //     (fa.type === 'interval' || fa.type === 'baseTick') &&
  //     fa.time &&
  //     fa.time > currentTime
  //   )
  // })
  // const timeTillNextUpdate = minBy(
  //   relevantLogsForNextUpdate,
  //   (fa) => fa.time!,
  // )?.time

  // if (sideIdx === 0 && itemIdx === 1) {
  //   console.log({
  //     nextItemActivation,
  //     currentTime,
  //     timeTillNextUpdate,
  //     futureActions,
  //   })
  // }

  // if (
  //   !nextItemActivation ||
  //   typeof currentTime === 'undefined' ||
  //   nextItemActivation.type !== 'interval' ||
  //   !timeTillNextUpdate
  // ) {
  //   // console.log({ nextItemActivation, currentTime, timeTillNextUpdate })

  //   return <></>
  // }

  // const {
  //   time: timeToUseItemAgain,
  //   lastUsed,
  //   currentCooldown,
  // } = nextItemActivation

  // const cooldownProgressPercentOnNextUpdate =
  //   (currentCooldown ?? 0 > 0)
  //     ? Math.floor(
  //         Math.min(
  //           100,
  //           ((timeTillNextUpdate - lastUsed) / currentCooldown!) * 100,
  //         ),
  //       )
  //     : 0

  // // if (cooldownProgressPercentOnNextUpdate !== currentPercent) {
  // //   setCurrentPercent(cooldownProgressPercentOnNextUpdate)
  // // }

  // let animationDuration = timeTillNextUpdate
  //   ? timeTillNextUpdate - currentTime
  //   : 0

  // // if (cooldownProgressPercentOnNextUpdate === 100) {
  // //   setTimeout(() => {
  // //     animationDuration = 0
  // //     setCurrentPercent(0)
  // //   }, animationDuration)
  // // }

  // if (sideIdx === 0 && itemIdx === 1) {
  //   console.log({
  //     timeTillNextUpdate,
  //     currentTime,
  //     cooldownProgressPercent: cooldownProgressPercentOnNextUpdate,
  //     animationDuration,
  //     nextItemActivation,
  //     futueActions: activeMatchLog?.log.stateSnapshot.futureActions,
  //   })
  // }

  const newHeight = (progress / cooldown) * 100
  // console.log({ progress, cooldown, newHeight })

  return (
    <motion.div
      // style={styles.cooldownOverlay}
      className="absolute bottom-0 right-0 left-0 bg-gray-500 bg-opacity-50"
      initial={{ height: '0%' }}
      animate={{ height: `${newHeight}%` }}
      transition={{ duration: tick / 1000, ease: 'linear' }}
    />
    // <motion.div
    //   className="absolute bottom-0 bg-gray-500 bg-opacity-50 left-0 right-0 "
    //   animate={{ height: `${cooldownProgressPercentOnNextUpdate}%` }}
    //   transition={{ duration: animationDuration / 1000 }}
    // ></motion.div>
  )
}
