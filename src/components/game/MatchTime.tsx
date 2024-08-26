'use client'

import { useMatchTime } from './useMatchTime'

export const MatchTime = () => {
  const time = useMatchTime()
  return <span className="font-mono text-sm">{(time / 1000).toFixed(1)}s</span>
}
