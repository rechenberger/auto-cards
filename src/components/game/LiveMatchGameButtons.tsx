'use client'

import { useLiveMatchCommand } from '@/client/api/liveMatches'
import { Button } from '@/components/ui/button'
import { LiveMatchViewDto } from '@/contracts/live-api'

export const LiveMatchGameButtons = ({
  liveMatch,
}: {
  liveMatch: LiveMatchViewDto
}) => {
  const action = useLiveMatchCommand(liveMatch.id)
  const me = liveMatch.me
  if (!me) return null

  if (liveMatch.canStartMatches) {
    return (
      <Button
        type="button"
        className="min-h-11 touch-manipulation"
        disabled={action.isPending}
        onClick={() => action.mutate({ command: { type: 'start-matches' } })}
      >
        {action.isPending ? 'Starting matches…' : 'Start Matches'}
      </Button>
    )
  }

  if (!me.ready) {
    return (
      <Button
        type="button"
        className="min-h-11 touch-manipulation"
        disabled={action.isPending}
        onClick={() => action.mutate({ command: { type: 'ready' } })}
      >
        {action.isPending ? 'Readying…' : 'Ready up!'}
      </Button>
    )
  }

  return (
    <div
      className="min-h-11 rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-center text-sm text-green-600 dark:text-green-400"
      role="status"
    >
      {liveMatch.participants.length < 2
        ? 'Ready — waiting for another player'
        : !me.isHost && liveMatch.allReady
          ? 'Ready — waiting for the host'
          : 'Ready — waiting for the others'}
    </div>
  )
}
