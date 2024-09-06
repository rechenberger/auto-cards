'use client'

import { useAtomValue } from 'jotai'
import { activeMatchLogAtom } from './matchPlaybackState'

export const MatchCardCooldown = ({
  itemIdx,
  sideIdx,
}: {
  itemIdx: number
  sideIdx: number
}) => {
  const activeMatchLog = useAtomValue(activeMatchLogAtom)
  const item = activeMatchLog?.log.stateSnapshot.futureActionsItems.find(
    (fai) =>
      fai.type === 'interval' &&
      fai.itemIdx === itemIdx &&
      fai.sideIdx === sideIdx &&
      !!fai.currentCooldown,
  )

  const currentCooldown = item?.currentCooldown ?? 0
  return `Every ${currentCooldown / 1000}s`
}
