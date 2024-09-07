'use client'

import { useAtomValue } from 'jotai'
import { activeMatchLogAtom } from './matchPlaybackState'

export const MatchCardCooldown = ({
  itemIdx,
  sideIdx,
  triggerIdx,
}: {
  itemIdx: number
  sideIdx: number
  triggerIdx: number
}) => {
  const activeMatchLog = useAtomValue(activeMatchLogAtom)
  const item = activeMatchLog?.log.stateSnapshot.futureActions.find(
    (fai) =>
      fai.type === 'interval' &&
      fai.itemIdx === itemIdx &&
      fai.sideIdx === sideIdx &&
      fai.triggerIdx === triggerIdx &&
      !!fai.currentCooldown,
  )

  const currentCooldown =
    item?.type === 'interval' ? (item?.currentCooldown ?? 0) : 0
  return (
    <>
      Every <strong className="text-primary">{currentCooldown / 1000}s</strong>
    </>
  )
}
