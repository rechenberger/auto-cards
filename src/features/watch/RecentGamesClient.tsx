'use client'

import { useRecentGames } from '@/client/api/watch'
import { QueryError, QueryLoading } from '@/components/api/QueryState'
import { TimeAgo } from '@/components/simple/TimeAgo'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { capitalCase } from 'change-case'
import { getNumberOfRounds } from '@/game/gameVersion'
import { PublicRoundBoard } from './PublicRoundBoard'

export const RecentGamesClient = () => {
  const games = useRecentGames()
  if (games.isLoading) return <QueryLoading label="Loading recent games…" />
  if (games.error || !games.data) {
    return <QueryError error={games.error} retry={() => games.refetch()} />
  }
  return (
    <div className="grid gap-4 text-center xl:grid-cols-3">
      {games.data.games.map((game) => (
        <Card key={game.id} className="flex flex-col">
          <CardHeader>
            <CardTitle>{game.displayName}</CardTitle>
            <CardDescription>
              {game.updatedAt && <TimeAgo date={new Date(game.updatedAt)} />}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col items-center gap-4">
            {game.gameMode === 'shopper' ? (
              <PublicRoundBoard
                rounds={game.rounds}
                numberOfRounds={getNumberOfRounds(game.version)}
              />
            ) : (
              <div className="flex flex-col gap-2 text-left">
                {game.dungeonAccesses?.map((access) => (
                  <div key={access.name} className="flex gap-4">
                    <span className="flex-1">{capitalCase(access.name)}</span>
                    <span className="tabular-nums">{access.levelMax}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
