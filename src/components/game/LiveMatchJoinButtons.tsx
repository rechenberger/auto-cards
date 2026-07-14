'use client'

import { useLiveMatchCommand } from '@/client/api/liveMatches'
import { Button } from '@/components/ui/button'
import { LiveMatchViewDto } from '@/contracts/live-api'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export const LiveMatchJoinButtons = ({
  liveMatch,
}: {
  liveMatch: LiveMatchViewDto
}) => {
  const router = useRouter()
  const action = useLiveMatchCommand(liveMatch.id)

  if (!liveMatch.me) {
    return (
      <Button
        type="button"
        className="min-h-11 touch-manipulation"
        disabled={liveMatch.status !== 'open' || action.isPending}
        onClick={() => action.mutate({ command: { type: 'join' } })}
      >
        {action.isPending
          ? 'Joining…'
          : liveMatch.status === 'open'
            ? 'Join Match'
            : 'Match is closed'}
      </Button>
    )
  }

  if (liveMatch.me.gameId) {
    return (
      <Button asChild className="min-h-11 touch-manipulation">
        <Link href={`/game/${liveMatch.me.gameId}`}>Resume Game</Link>
      </Button>
    )
  }

  return (
    <Button
      type="button"
      className="min-h-11 touch-manipulation"
      disabled={action.isPending}
      onClick={() =>
        action.mutate(
          { command: { type: 'start-game' } },
          {
            onSuccess: (response) => {
              if (response.redirectTo) router.push(response.redirectTo)
            },
          },
        )
      }
    >
      {action.isPending ? 'Starting…' : 'Start Game'}
    </Button>
  )
}
