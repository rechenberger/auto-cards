'use client'

import { LiveMatchResults } from '@/components/game/LiveMatchResults'
import { QueryError, QueryLoading } from '@/components/api/QueryState'
import { AsyncButton } from '@/components/ui/async-button'
import { Button } from '@/components/ui/button'
import { useCatalog, useMeta } from '@/client/api/catalog'
import { useCreateGame, useGameCommand, useGameView } from '@/client/api/games'
import { countifyItems } from '@/game/countifyItems'
import { orderItems } from '@/game/orderItems'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { GameMatchBoardClient } from './GameMatchBoardClient'
import { ItemCardClient } from './ItemCardClient'
import { ShopClient } from './ShopClient'
import { CardRow } from '@/components/game/CardRow'
import { HandDisplay } from '@/components/game/HandDisplay'
import { TitleScreen } from '@/components/game/TitleScreen'
import { LeaderboardRankBadge } from '@/components/game/LeaderboardRankBadge'
import { LoadoutInfoClient } from './LoadoutInfoClient'
import { calcStats } from '@/game/calcStats'
import { fontLore } from '@/lib/fonts'
import { cn } from '@/lib/utils'

const MatchReplayPage = dynamic(
  () =>
    import('@/components/game/MatchReplayPage').then(
      (module) => module.MatchReplayPage,
    ),
  {
    ssr: false,
    loading: () => <QueryLoading label="Loading replay…" />,
  },
)

const CollectorGameClient = dynamic(
  () =>
    import('./collector/CollectorGameClient').then(
      (module) => module.CollectorGameClient,
    ),
  {
    ssr: false,
    loading: () => <QueryLoading label="Loading endless mode…" />,
  },
)

export const GamePageClient = ({ gameId }: { gameId: string }) => {
  const router = useRouter()
  const gameQuery = useGameView(gameId)
  const metaQuery = useMeta()
  const catalogQuery = useCatalog(metaQuery.data?.viewer?.themeId)
  const command = useGameCommand(gameId)
  const createGame = useCreateGame()

  if (gameQuery.isLoading || metaQuery.isLoading || catalogQuery.isLoading) {
    return <QueryLoading label="Loading game…" />
  }
  if (gameQuery.error || metaQuery.error || catalogQuery.error) {
    return (
      <QueryError
        error={gameQuery.error ?? metaQuery.error ?? catalogQuery.error}
        retry={() => {
          gameQuery.refetch()
          metaQuery.refetch()
          catalogQuery.refetch()
        }}
      />
    )
  }
  if (!gameQuery.data || !catalogQuery.data) return null

  const view = gameQuery.data
  const catalog = catalogQuery.data

  if (view.phase === 'match' && view.currentMatchId) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <MatchReplayPage
          matchId={view.currentMatchId}
          overviewContent={
            view.game.liveMatchId ? (
              <LiveMatchResults liveMatchId={view.game.liveMatchId} />
            ) : undefined
          }
          controls={
            <AsyncButton
              variant="outline"
              className="min-h-11 min-w-36"
              onAction={() => command.mutateAsync({ type: 'next-round' })}
            >
              Next Round
            </AsyncButton>
          }
        />
      </div>
    )
  }

  if (view.phase === 'ended') {
    const items = orderItems(
      countifyItems(view.game.data.currentLoadout.items),
      view.game.version,
    )
    const stats = calcStats({
      loadout: view.game.data.currentLoadout,
      gameVersion: view.game.version,
    })
    return (
      <>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <div className="flex flex-col gap-4 rounded-lg bg-background/80 p-4">
            {view.isOldVersion && (
              <div className="text-sm text-amber-500">Old Game Version</div>
            )}
            <div className={fontLore.className}>
              <h1 className="text-2xl font-bold">
                You will never be forgotten
              </h1>
              <p className="text-xs opacity-60">
                unless I accidentally delete the database
              </p>
            </div>
            <GameMatchBoardClient view={view} />
          </div>
          {!view.isOldVersion && view.game.liveMatchId && (
            <LiveMatchResults liveMatchId={view.game.liveMatchId} />
          )}
          {!view.isOldVersion && view.leaderboard && (
            <LeaderboardRankBadge summary={view.leaderboard} />
          )}

          <div className="flex flex-col gap-4 self-stretch">
            <div className="xl:hidden">
              <CardRow>
                {items.map((item, index) => (
                  <ItemCardClient
                    key={`${item.name}-${index}`}
                    itemData={item}
                    catalog={catalog}
                    size="160"
                  />
                ))}
              </CardRow>
            </div>
            <div className="max-xl:hidden">
              <HandDisplay>
                {items.map((item, index) => (
                  <ItemCardClient
                    key={`${item.name}-${index}`}
                    itemData={item}
                    catalog={catalog}
                    size="240"
                  />
                ))}
              </HandDisplay>
            </div>
            <div className="flex flex-col items-center">
              <LoadoutInfoClient
                loadout={view.game.data.currentLoadout}
                catalog={catalog}
                stats={stats}
              />
            </div>
          </div>
          <div />
          <Button
            type="button"
            variant="outline"
            className={cn('min-h-11')}
            disabled={createGame.isPending}
            onClick={async () => {
              const next = await createGame.mutateAsync({
                gameMode: 'shopper',
              })
              router.push(`/game/${next.game.id}`)
            }}
          >
            New Game
          </Button>
        </div>
        <TitleScreen />
      </>
    )
  }

  if (view.phase === 'collector') {
    return <CollectorGameClient view={view} catalog={catalog} />
  }

  return (
    <ShopClient
      view={view}
      catalog={catalog}
      command={(nextCommand) => command.mutateAsync(nextCommand)}
    />
  )
}
