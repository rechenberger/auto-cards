'use client'

import { useMe } from '@/client/api/auth'
import { useCreateLiveMatch } from '@/client/api/liveMatches'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoaderCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export default function Page() {
  const router = useRouter()
  const me = useMe()
  const createLiveMatch = useCreateLiveMatch()
  const [attempt, setAttempt] = useState(0)
  const started = useRef(false)
  const idempotencyKey = useRef<string | undefined>(undefined)
  if (!idempotencyKey.current) idempotencyKey.current = crypto.randomUUID()

  useEffect(() => {
    if (!me.data) return
    if (started.current) return
    started.current = true
    createLiveMatch.mutate(
      { idempotencyKey: idempotencyKey.current },
      {
        onSuccess: (liveMatch) => router.replace(`/live/${liveMatch.id}`),
      },
    )
  }, [attempt, createLiveMatch, me.data, router])

  const unauthenticated = !me.isLoading && me.data === null

  useEffect(() => {
    if (!unauthenticated) return
    router.replace('/auth/login?redirect=%2Flive%2Fnew')
  }, [router, unauthenticated])

  if (me.isError || (createLiveMatch.isError && !unauthenticated)) {
    return (
      <Card className="flex min-h-48 w-64 flex-col items-center justify-center gap-3 self-center p-6 text-center">
        <div className="font-semibold">Could not start live match</div>
        <div className="text-sm text-muted-foreground">
          {(me.error ?? createLiveMatch.error)?.message}
        </div>
        <Button
          type="button"
          variant="outline"
          className="min-h-11 touch-manipulation"
          onClick={() => {
            idempotencyKey.current = crypto.randomUUID()
            started.current = false
            setAttempt((current) => current + 1)
          }}
        >
          Try again
        </Button>
      </Card>
    )
  }

  return (
    <Card
      className="flex min-h-48 w-64 flex-col items-center justify-center gap-3 self-center p-6 text-center"
      role="status"
    >
      <LoaderCircle className="size-6 animate-spin motion-reduce:animate-none" />
      <div className="font-semibold">Starting live match…</div>
      <div className="text-sm text-muted-foreground">
        Creating the lobby and invite link.
      </div>
    </Card>
  )
}
