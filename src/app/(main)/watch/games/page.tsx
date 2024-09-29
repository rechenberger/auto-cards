import { GameMatchBoard } from '@/components/game/GameMatchBoard'
import { LeaderboardRankCardByGame } from '@/components/game/LeaderboardRankCardByGame'
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
          <div className="flex flex-row gap-4 justify-center items-center">
            <GameMatchBoard game={game} />
            <LeaderboardRankCardByGame gameId={game.id} tiny />
          </div>
        </CardContent>
      </Card>
    </>
  )
}
