'use client'

import { Suspense, useEffect, useState } from 'react'
import { timeAgo } from './timeAgoString'

type Props = {
  date: Date
}

export const TimeAgo = ({ date }: Props) => {
  const [timeAgoState, setTimeAgoState] = useState(timeAgo(date))

  useEffect(() => {
    setTimeAgoState(timeAgo(date))
    const interval = setInterval(() => {
      setTimeAgoState(timeAgo(date))
    }, 30000)

    return () => clearInterval(interval)
  }, [date])

  return <Suspense>{timeAgoState}</Suspense>
}
