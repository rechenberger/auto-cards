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
      fai.sideIdx === sideIdx,
  )
  const lastused = item?.lastUsed ?? 0
  const nextuse = item?.time ?? 0

  //TODO: sometimes lastused and nextuse is same value, which causes 0s flickering

  const currentCooldown = nextuse - lastused
  return `Every ${currentCooldown / 1000}s`
}
