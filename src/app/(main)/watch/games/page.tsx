import { GameMatchBoard } from '@/components/game/GameMatchBoard'
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
      <div className="grid xl:grid-cols-3 gap-4 justify-center items-center text-center">
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
      <Card>
        <CardHeader>
          <CardTitle>{getUserName({ user: game.user })}</CardTitle>
          <CardDescription>
            <TimeAgo date={new Date(game.updatedAt ?? '')} />
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 items-center">
          <GameMatchBoard game={game} />
        </CardContent>
      </Card>
    </>
  )
}
