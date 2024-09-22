'use client'

import { useAtomValue } from 'jotai'
import { ReactNode } from 'react'
import { activeMatchLogAtom } from './matchPlaybackState'

export const MatchReportShowWhenDone = ({
  children,
}: {
  children: ReactNode
}) => {
  const activeMatchLog = useAtomValue(activeMatchLogAtom)

  const isDone = activeMatchLog?.log?.isDone

  if (isDone) return children

  return null
}
