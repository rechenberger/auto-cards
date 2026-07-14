'use client'

import { useMeta } from '@/client/api/catalog'
import { useRecentMatches } from '@/client/api/watch'
import { QueryError, QueryLoading } from '@/components/api/QueryState'
import { TimeAgo } from '@/components/simple/TimeAgo'
import { countifyItems } from '@/game/countifyItems'
import { orderItems } from '@/game/orderItems'
import Link from 'next/link'
import { TinyItem } from '@/components/game/TinyItem'

export const RecentMatchesClient = () => {
  const matches = useRecentMatches()
  const meta = useMeta()
  if (matches.isLoading || meta.isLoading) {
    return <QueryLoading label="Loading recent matches…" />
  }
  if (matches.error || meta.error) {
    return (
      <QueryError
        error={matches.error ?? meta.error}
        retry={() => {
          matches.refetch()
          meta.refetch()
        }}
      />
    )
  }
  if (!matches.data) return null

  return (
    <div className="grid grid-cols-3 items-center justify-center gap-2 gap-y-12 text-center">
      {matches.data.matches.flatMap((match) => {
        const [left, right] = match.participants
        if (!left || !right) return []
        const renderItems = (
          participant: (typeof match.participants)[number],
          alignment: 'start' | 'end',
        ) => {
          const items = orderItems(
            countifyItems(participant.loadout.items),
            meta.data?.rulesetVersion,
          )
          return (
            <div
              key={`${match.id}-${participant.sideIdx}`}
              className={`flex flex-wrap items-start gap-1 ${
                alignment === 'end' ? 'justify-end' : 'justify-start'
              }`}
            >
              {items.map((item, index) => (
                <TinyItem key={`${item.name}-${index}`} itemData={item} />
              ))}
            </div>
          )
        }

        return [
          renderItems(left, 'end'),
          <Link
            key={`${match.id}-summary`}
            href={`/match/${match.id}`}
            className="rounded-md p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="text-xs opacity-60">Round {match.roundNo + 1}</div>
            <div>
              {left.status === 'won' && '👑 '}
              {left.displayName}
              {' vs '}
              {right.displayName}
              {right.status === 'won' && ' 👑'}
            </div>
            {match.createdAt && (
              <div className="text-xs opacity-60">
                <TimeAgo date={new Date(match.createdAt)} />
              </div>
            )}
          </Link>,
          renderItems(right, 'start'),
        ]
      })}
    </div>
  )
}
