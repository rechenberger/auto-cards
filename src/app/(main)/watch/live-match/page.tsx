import { LiveMatchResults } from '@/components/game/LiveMatchResults'
import { TimeAgo } from '@/components/simple/TimeAgo'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { desc } from 'drizzle-orm'
import { Metadata } from 'next'
import { Fragment } from 'react'

export const metadata: Metadata = {
  title: 'Live Matches',
}

export default async function Page() {
  const matches = await db.query.liveMatch.findMany({
    orderBy: desc(schema.liveMatch.createdAt),
    limit: 10,
  })
  return (
    <>
      <div className="grid md:grid-cols-[auto_1fr] gap-4">
        {matches.map((match) => (
          <Fragment key={match.id}>
            <div className="py-2">
              <TimeAgo date={new Date(match.createdAt ?? '')} />
            </div>
            <div>
              <LiveMatchResults liveMatchId={match.id} />
            </div>
          </Fragment>
        ))}
      </div>
    </>
  )
}
