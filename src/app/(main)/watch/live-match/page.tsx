'use client'

import { useLatestLiveMatches } from '@/client/api/liveMatches'
import { QueryError, QueryLoading } from '@/components/api/QueryState'
import { LiveMatchResults } from '@/components/game/LiveMatchResults'
import { TimeAgo } from '@/components/simple/TimeAgo'

export default function Page() {
  const liveMatches = useLatestLiveMatches()
  if (liveMatches.isLoading) {
    return <QueryLoading label="Loading live matches…" />
  }
  if (liveMatches.isError || !liveMatches.data) {
    return (
      <QueryError
        error={liveMatches.error}
        retry={() => void liveMatches.refetch()}
      />
    )
  }

  return (
    <div className="grid gap-4 self-center md:grid-cols-[auto_1fr]">
      {liveMatches.data.matches.map((match) => (
        <div key={match.id} className="contents">
          <div className="py-4 text-sm text-muted-foreground">
            {match.createdAt ? (
              <TimeAgo date={new Date(match.createdAt)} />
            ) : (
              'Unknown date'
            )}
          </div>
          <LiveMatchResults liveMatchId={match.id} />
        </div>
      ))}
    </div>
  )
}
