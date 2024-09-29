import { GameMatchBoard } from '@/components/game/GameMatchBoard'
import { LeaderboardRankCard } from '@/components/game/LeaderboardRankCard'
import { TimeAgo } from '@/components/simple/TimeAgo'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { getUserName } from '@/game/getUserName'
import { desc } from 'drizzle-orm'
import { first } from 'lodash-es'
import { Metadata } from 'next'
import { Fragment } from 'react'

export const metadata: Metadata = {
  title: 'Recent Games',
}

const getGames = async () => {
  return await db.query.game.findMany({
    orderBy: desc(schema.game.updatedAt),
    limit: 24,
    with: {
      user: true,
      loadouts: {
        orderBy: desc(schema.loadout.roundNo),
        limit: 1,
      },
    },
  })
}
type Game = Awaited<ReturnType<typeof getGames>>[number]

export default async function Page() {
  const games = await getGames()
  return (
    <>
      <div className="grid xl:grid-cols-3 gap-4 text-center">
        {games.map((game) => (
          <Fragment key={game.id}>
            <GameEntry game={game} />
          </Fragment>
        ))}
      </div>
    </>
  )
}

const GameEntry = async ({ game }: { game: Game }) => {
  const loadout = first(game.loadouts)
  return (
    <>
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>{getUserName({ user: game.user })}</CardTitle>
          <CardDescription>
            <TimeAgo date={new Date(game.updatedAt ?? '')} />
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4 items-center">
          <GameMatchBoard game={game} />
          {loadout && <LeaderboardRankCard loadout={loadout} />}
        </CardContent>
      </Card>
    </>
  )
}
