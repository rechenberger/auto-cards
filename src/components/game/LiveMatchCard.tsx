'use client'

import { useMe } from '@/client/api/auth'
import { useLiveMatch } from '@/client/api/liveMatches'
import { QueryError } from '@/components/api/QueryState'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { RefreshCw, Trophy, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { LiveMatchCopyButton } from './LiveMatchCopyButton'
import { LiveMatchGameButtons } from './LiveMatchGameButtons'
import { LiveMatchJoinButtons } from './LiveMatchJoinButtons'
import { LiveMatchResults } from './LiveMatchResults'

export const LiveMatchCard = ({
  liveMatchId,
  inGame,
}: {
  liveMatchId: string
  inGame: boolean
}) => {
  const router = useRouter()
  const me = useMe()
  const liveMatch = useLiveMatch(me.data ? liveMatchId : null)
  const unauthenticated = !me.isLoading && me.data === null

  useEffect(() => {
    if (!unauthenticated) return
    const redirect = `${window.location.pathname}${window.location.search}`
    router.replace(`/auth/login?redirect=${encodeURIComponent(redirect)}`)
  }, [router, unauthenticated])

  if (me.isLoading || liveMatch.isLoading || unauthenticated) {
    return (
      <Card
        className="flex w-56 flex-col gap-2 p-2"
        aria-label="Loading live match"
      >
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-11 w-full" />
      </Card>
    )
  }
  if (me.isError || liveMatch.isError || !liveMatch.data) {
    return (
      <QueryError
        error={me.error ?? liveMatch.error}
        retry={() => {
          void me.refetch()
          void liveMatch.refetch()
        }}
      />
    )
  }

  const view = liveMatch.data

  return (
    <Card className="flex w-56 flex-col gap-2 p-2">
      <div className="flex items-center gap-1">
        <Zap className="size-4 text-amber-500" aria-hidden="true" />
        <div className="flex-1 font-semibold">Live Match</div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="min-h-11 min-w-11 touch-manipulation"
          aria-label="Refresh live match"
          disabled={liveMatch.isFetching}
          onClick={() => void liveMatch.refetch()}
        >
          <RefreshCw
            className={cn(
              'size-4',
              liveMatch.isFetching && 'animate-spin motion-reduce:animate-none',
            )}
            aria-hidden="true"
          />
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="min-h-11 min-w-11 touch-manipulation"
              aria-label="Show live match results"
            >
              <Trophy className="size-4" aria-hidden="true" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Live Match Results</DialogTitle>
              <DialogDescription>
                Round scores and the latest loadout for every player.
              </DialogDescription>
            </DialogHeader>
            <LiveMatchResults liveMatchId={liveMatchId} showCards poll />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-1 text-sm" aria-live="polite">
        {view.participants.map((participant) => (
          <div
            key={participant.id}
            className={cn(
              'flex gap-2 rounded px-1 py-0.5',
              participant.ready && 'text-green-600 dark:text-green-400',
              !inGame &&
                participant.hasGame &&
                'text-green-600 dark:text-green-400',
            )}
          >
            <div className="min-w-0 flex-1 truncate">
              {participant.displayName}
              {participant.isHost && ' (Host)'}
              {participant.isCurrentUser && (
                <span className="sr-only"> (you)</span>
              )}
            </div>
            <div className="shrink-0 text-right text-xs">
              {participant.ready
                ? 'Ready'
                : inGame
                  ? 'Not Ready'
                  : participant.hasGame
                    ? 'Started'
                    : 'Joined'}
            </div>
          </div>
        ))}
      </div>

      {view.status === 'open' && (
        <LiveMatchCopyButton liveMatchId={liveMatchId} />
      )}
      {inGame ? (
        <LiveMatchGameButtons liveMatch={view} />
      ) : (
        <LiveMatchJoinButtons liveMatch={view} />
      )}
    </Card>
  )
}
