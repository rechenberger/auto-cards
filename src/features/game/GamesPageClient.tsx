'use client'

import { QueryError, QueryLoading } from '@/components/api/QueryState'
import { TimeAgo } from '@/components/simple/TimeAgo'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ConfirmButton } from '@/components/ui/confirm-button'
import { useCatalog, useMeta } from '@/client/api/catalog'
import { useCreateGame, useDeleteGame, useGames } from '@/client/api/games'
import { countifyItems } from '@/game/countifyItems'
import { orderItems } from '@/game/orderItems'
import { Zap } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { GameMatchBoardClient } from './GameMatchBoardClient'
import { ItemCardClient } from './ItemCardClient'

export const GamesPageClient = () => {
  const router = useRouter()
  const games = useGames()
  const meta = useMeta()
  const catalog = useCatalog(meta.data?.viewer?.themeId)
  const createGame = useCreateGame()
  const deleteGame = useDeleteGame()

  if (games.isLoading || meta.isLoading || catalog.isLoading) {
    return <QueryLoading label="Loading games…" />
  }
  if (games.error || meta.error || catalog.error) {
    return (
      <QueryError
        error={games.error ?? meta.error ?? catalog.error}
        retry={() => {
          games.refetch()
          meta.refetch()
          catalog.refetch()
        }}
      />
    )
  }
  if (!games.data || !catalog.data) return null

  const startGame = async (gameMode: 'shopper' | 'collector') => {
    const view = await createGame.mutateAsync({ gameMode })
    router.push(`/game/${view.game.id}`)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 md:flex-row">
        <h1 className="flex-1 text-xl font-bold">My Games</h1>
        <div className="flex flex-wrap justify-center gap-2">
          <Button asChild variant="outline" className="min-h-11">
            <Link href="/live/new">Start Live Match</Link>
          </Button>
          {games.data.isAdmin && (
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              disabled={createGame.isPending}
              onClick={() => startGame('collector')}
            >
              New Endless Game
            </Button>
          )}
          <Button
            type="button"
            className="min-h-11"
            disabled={createGame.isPending}
            onClick={() => startGame('shopper')}
          >
            New Game
          </Button>
        </div>
      </div>

      {games.data.games.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          No games yet. Start one when you are ready.
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {games.data.games.map((view) => {
            const items = orderItems(
              countifyItems(view.game.data.currentLoadout.items),
              view.game.version,
            )
            return (
              <Card
                key={view.game.id}
                className="flex flex-col items-center gap-4 p-4"
              >
                {view.game.gameMode === 'shopper' ? (
                  <GameMatchBoardClient view={view} />
                ) : (
                  <div>Endless Mode</div>
                )}
                <div className="flex flex-wrap items-center justify-center gap-1">
                  {items.map((item, index) => (
                    <ItemCardClient
                      key={`${item.name}-${index}`}
                      itemData={item}
                      catalog={catalog.data}
                      size="80"
                    />
                  ))}
                </div>
                {view.game.liveMatchId && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Zap className="size-3" aria-hidden="true" /> Live Match
                  </div>
                )}
                {view.game.updatedAt && (
                  <div className="text-sm text-muted-foreground">
                    <TimeAgo date={new Date(view.game.updatedAt)} />
                  </div>
                )}
                <div className="mt-auto flex gap-2">
                  {games.data.isAdmin && (
                    <ConfirmButton
                      variant="outline"
                      className="min-h-11"
                      disabled={deleteGame.isPending}
                      title="Delete this game?"
                      description="This removes the game from your game list."
                      confirmLabel="Delete"
                      cancelLabel="Keep game"
                      onConfirm={() => deleteGame.mutateAsync(view.game.id)}
                    >
                      Delete
                    </ConfirmButton>
                  )}
                  <Button asChild className="min-h-11">
                    <Link href={`/game/${view.game.id}`}>Resume Game</Link>
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
