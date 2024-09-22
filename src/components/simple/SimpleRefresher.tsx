'use client'

import { cn } from '@/lib/utils'
import { RotateCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '../ui/button'

export const SimpleRefresher = ({
  ms = 4_000,
  forceState,
}: {
  ms?: number
  forceState?: boolean
}) => {
  const router = useRouter()
  const [active, setActive] = useState(forceState ?? false)

  const forced = forceState !== undefined

  useEffect(() => {
    if (!active) return
    const timeout = setInterval(() => {
      router.refresh()
    }, ms)
    return () => {
      clearInterval(timeout)
    }
  }, [active, router, ms])

  return (
    <>
      <Button
        variant={forced ? 'vanilla' : 'ghost'}
        size={forced ? 'vanilla' : 'icon'}
        className={forced ? 'p-1' : ''}
        onClick={() => !forced && setActive(!active)}
        title="auto-refresh"
        disabled={forced}
      >
        <RotateCw className={cn('size-4', active && 'animate-spin')} />
      </Button>
    </>
  )
}
