'use client'

import { useCatalog, useMeta } from '@/client/api/catalog'
import { useRecentMatches } from '@/client/api/watch'
import { QueryError, QueryLoading } from '@/components/api/QueryState'
import { TimeAgo } from '@/components/simple/TimeAgo'
import { countifyItems } from '@/game/countifyItems'
import { orderItems } from '@/game/orderItems'
import Link from 'next/link'
import { ItemCardClient } from '@/features/game/ItemCardClient'

export const RecentMatchesClient = () => {
  const matches = useRecentMatches()
  const meta = useMeta()
  const catalog = useCatalog(meta.data?.viewer?.themeId)
  if (matches.isLoading || catalog.isLoading) {
    return <QueryLoading label="Loading recent matches…" />
  }
  if (matches.error || catalog.error) {
    return (
      <QueryError
        error={matches.error ?? catalog.error}
        retry={() => {
          matches.refetch()
          catalog.refetch()
        }}
      />
    )
  }
  if (!matches.data || !catalog.data) return null

  return (
    <div className="flex flex-col gap-8">
      {matches.data.matches.map((match) => (
        <div
          key={match.id}
          className="grid items-center gap-3 text-center md:grid-cols-[1fr_auto_1fr]"
        >
          {match.participants.map((participant, sideIdx) => {
            const items = orderItems(
              countifyItems(participant.loadout.items),
              meta.data?.rulesetVersion,
            )
            return (
              <div
                key={participant.sideIdx}
                className={sideIdx === 1 ? 'md:order-3' : undefined}
              >
                <div className="mb-2 font-medium">
                  {participant.status === 'won' && '👑 '}
                  {participant.displayName}
                </div>
                <div className="flex flex-wrap justify-center gap-1">
                  {items.map((item, index) => (
                    <ItemCardClient
                      key={`${item.name}-${index}`}
                      itemData={item}
                      catalog={catalog.data}
                      size="80"
                    />
                  ))}
                </div>
              </div>
            )
          })}
          <Link
            href={`/match/${match.id}`}
            className="rounded-md p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:order-2"
          >
            <div className="text-xs text-muted-foreground">
              Round {match.roundNo + 1}
            </div>
            <div>View replay</div>
            {match.createdAt && (
              <div className="text-xs text-muted-foreground">
                <TimeAgo date={new Date(match.createdAt)} />
              </div>
            )}
          </Link>
        </div>
      ))}
    </div>
  )
}
