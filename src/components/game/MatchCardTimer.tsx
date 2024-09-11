'use client'

import { MatchReport } from '@/game/generateMatch'
import { motion } from 'framer-motion'
import { useAtomValue } from 'jotai'
import { minBy } from 'lodash-es'
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
  // const [currentPercent, setCurrentPercent] = useState(0)
  const activeMatchLog = useAtomValue(activeMatchLogAtom)

  const futureActions = activeMatchLog?.log.stateSnapshot.futureActions
  if (!futureActions) return <></>

  const nextItemActivation = futureActions.find(
    (fai) =>
      fai.type === 'interval' &&
      fai.itemIdx === itemIdx &&
      fai.sideIdx === sideIdx,
    // &&
    // !!fai.currentCooldown,
  )
  const currentTime = activeMatchLog?.log.time

  const relevantLogsForNextUpdate = futureActions.filter((fa) => {
    return (
      (fa.type === 'interval' || fa.type === 'baseTick') &&
      fa.time &&
      fa.time > currentTime
    )
  })
  const timeTillNextUpdate = minBy(
    relevantLogsForNextUpdate,
    (fa) => fa.time!,
  )?.time

  if (sideIdx === 0 && itemIdx === 1) {
    console.log({
      nextItemActivation,
      currentTime,
      timeTillNextUpdate,
      futureActions,
    })
  }
  if (
    !nextItemActivation ||
    typeof currentTime === 'undefined' ||
    nextItemActivation.type !== 'interval' ||
    !timeTillNextUpdate
  ) {
    // console.log({ nextItemActivation, currentTime, timeTillNextUpdate })

    return <></>
  }

  const {
    time: timeToUseItemAgain,
    lastUsed,
    currentCooldown,
  } = nextItemActivation

  const cooldownProgressPercentOnNextUpdate =
    (currentCooldown ?? 0 > 0)
      ? Math.floor(
          Math.min(
            100,
            ((timeTillNextUpdate - lastUsed) / currentCooldown!) * 100,
          ),
        )
      : 0

  // if (cooldownProgressPercentOnNextUpdate !== currentPercent) {
  //   setCurrentPercent(cooldownProgressPercentOnNextUpdate)
  // }

  let animationDuration = timeTillNextUpdate
    ? timeTillNextUpdate - currentTime
    : 0

  // if (cooldownProgressPercentOnNextUpdate === 100) {
  //   setTimeout(() => {
  //     animationDuration = 0
  //     setCurrentPercent(0)
  //   }, animationDuration)
  // }

  if (sideIdx === 0 && itemIdx === 1) {
    console.log({
      timeTillNextUpdate,
      currentTime,
      cooldownProgressPercent: cooldownProgressPercentOnNextUpdate,
      animationDuration,
      nextItemActivation,
      futueActions: activeMatchLog?.log.stateSnapshot.futureActions,
    })
  }

  return (
    <motion.div
      className="absolute bottom-0 bg-gray-500 bg-opacity-50 left-0 right-0 "
      animate={{ height: `${cooldownProgressPercentOnNextUpdate}%` }}
      transition={{ duration: animationDuration / 1000 }}
    ></motion.div>
  )
}
