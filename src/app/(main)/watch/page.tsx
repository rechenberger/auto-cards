import { TimeAgo } from '@/components/simple/TimeAgo'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { countifyItems } from '@/game/countifyItems'
import { getUserName } from '@/game/getUserName'
import { orderItems } from '@/game/orderItems'
import { desc } from 'drizzle-orm'
import { Metadata } from 'next'
import Link from 'next/link'
import { Fragment } from 'react'
import { TinyItem } from '../simulation/TinyItem'

export const metadata: Metadata = {
  title: 'Watch',
}

const getMatches = async () => {
  return await db.query.match.findMany({
    orderBy: desc(schema.match.createdAt),
    limit: 20,
    with: {
      matchParticipations: {
        with: {
          user: true,
          loadout: true,
        },
      },
    },
  })
}
type Match = Awaited<ReturnType<typeof getMatches>>[number]

export default async function Page() {
  const matches = await getMatches()
  return (
    <>
      <div className="grid grid-cols-3 gap-2 gap-y-12 justify-center items-center text-center">
        {matches.map((match) => (
          <Fragment key={match.id}>
            <MatchEntry match={match} />
          </Fragment>
        ))}
      </div>
    </>
  )
}

const MatchEntry = async ({ match }: { match: Match }) => {
  const p1 = match.matchParticipations[0]
  const p2 = match.matchParticipations[1]

  if (!p1 || !p2) {
    return null
  }

  const p1Items = await orderItems(countifyItems(p1.loadout.data.items))
  const p2Items = await orderItems(countifyItems(p2.loadout.data.items))

  return (
    <>
      <div className="flex flex-row gap-1 flex-wrap items-start justify-end">
        {p1Items.map((item, idx) => (
          <Fragment key={idx}>
            <TinyItem name={item.name} count={item.count} />
          </Fragment>
        ))}
      </div>
      <Link href={`/match/${match.id}`}>
        <div>
          <div>
            {p1.status === 'won' && '👑 '}
            {p1.user ? getUserName({ user: p1.user }) : 'Bot'}
            {' vs '}
            {p2.user ? getUserName({ user: p2.user }) : 'Bot'}
            {p2.status === 'won' && ' 👑'}
          </div>
          <div>
            <TimeAgo date={new Date(match.createdAt ?? '')} />
          </div>
        </div>
      </Link>
      <div className="flex flex-row gap-1 flex-wrap items-start justify-start">
        {p2Items.map((item, idx) => (
          <Fragment key={idx}>
            <TinyItem name={item.name} count={item.count} />
          </Fragment>
        ))}
      </div>
    </>
  )
}
