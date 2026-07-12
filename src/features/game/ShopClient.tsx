'use client'

import { CardRow } from '@/components/game/CardRow'
import { invalidateGame } from '@/client/api/games'
import { useLiveMatch } from '@/client/api/liveMatches'
import { LiveMatchCard } from '@/components/game/LiveMatchCard'
import { StatsDisplay } from '@/components/game/StatsDisplay'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { AsyncButton } from '@/components/ui/async-button'
import { CatalogResponse } from '@/contracts/catalog'
import { GameCommand, GameViewDto } from '@/contracts/game-api'
import { calcStats } from '@/game/calcStats'
import { countifyItems } from '@/game/countifyItems'
import { getSpecialBuyRound } from '@/game/getSpecialBuyRound'
import { orderItems } from '@/game/orderItems'
import { getRoundStats } from '@/game/roundStats'
import { cn } from '@/lib/utils'
import { Info, Lock, LockOpen, RotateCw } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { CraftingClient } from './CraftingClient'
import { GameMatchBoardClient } from './GameMatchBoardClient'
import { ItemCardClient } from './ItemCardClient'

export const ShopClient = ({
  view,
  catalog,
  command,
}: {
  view: GameViewDto
  catalog: CatalogResponse
  command: (command: GameCommand) => Promise<unknown>
}) => {
  const { game } = view
  const queryClient = useQueryClient()
  const liveMatch = useLiveMatch(game.liveMatchId)
  const wasReady = useRef(false)
  const currentReady = liveMatch.data?.me?.ready

  useEffect(() => {
    if (currentReady === undefined) return
    if (wasReady.current && !currentReady) {
      void invalidateGame({ gameId: game.id, queryClient })
    }
    wasReady.current = currentReady
  }, [currentReady, game.id, queryClient])

  const shopLocked = Boolean(liveMatch.data?.me?.ready)
  const stats = calcStats({
    loadout: game.data.currentLoadout,
    gameVersion: game.version,
  })
  const specialBuyRound = getSpecialBuyRound({ game })
  const shopItems = orderItems(
    game.data.shopItems.map((item, index) => ({ ...item, index })),
    game.version,
  ).filter((item) => Boolean(item.isSpecial) === Boolean(specialBuyRound))
  const loadoutItems = orderItems(
    countifyItems(game.data.currentLoadout.items),
    game.version,
  )
  const currentRound = getRoundStats(game.version)[game.data.roundNo]

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col items-center gap-3 md:flex-row">
        <StatsDisplay
          stats={{ gold: game.data.gold, space: stats.space }}
          showZero
        />
        <div className="flex-1" />
        <GameMatchBoardClient view={view} />
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="flex size-11 touch-manipulation items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`Round ${game.data.roundNo + 1} information`}
            >
              <Info className="size-4" aria-hidden="true" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-64">
            <div className="font-semibold">Round {game.data.roundNo + 1}</div>
            {currentRound && (
              <div className="text-xs text-muted-foreground">
                Next shop income and rarity chances are deterministic for this
                ruleset.
              </div>
            )}
          </TooltipContent>
        </Tooltip>
        {!specialBuyRound && (
          <AsyncButton
            variant="outline"
            disabled={shopLocked || game.data.gold < 1}
            className="min-h-11"
            onAction={() => command({ type: 'reroll' })}
          >
            <RotateCw className="mr-2 size-4" aria-hidden="true" />
            <StatsDisplay disableTooltip stats={{ gold: 1 }} />
            <span className="sr-only">Reroll shop</span>
          </AsyncButton>
        )}
      </div>

      <CardRow>
        {shopItems.map((shopItem) => {
          const item = catalog.items.find(
            (candidate) => candidate.name === shopItem.name,
          )
          if (!item) return null
          const price = shopItem.isOnSale
            ? Math.ceil(item.price * 0.5)
            : item.price
          return (
            <div
              key={shopItem.index}
              className={cn(
                'flex flex-col items-center gap-2 pb-2',
                shopItem.isSold && 'grayscale opacity-60',
              )}
            >
              <ItemCardClient
                itemData={shopItem}
                catalog={catalog}
                shopState={shopItem}
                size="160"
              />
              {!shopItem.isSold && (
                <div className="flex items-stretch">
                  <AsyncButton
                    size="sm"
                    variant="secondary"
                    disabled={shopLocked || game.data.gold < price}
                    className="min-h-11 rounded-r-none"
                    onAction={() =>
                      command({ type: 'buy', shopItemIndex: shopItem.index })
                    }
                  >
                    Buy
                    <StatsDisplay
                      className="ml-2"
                      stats={{ gold: price }}
                      showZero
                      disableTooltip
                    />
                  </AsyncButton>
                  {!shopItem.isSpecial && (
                    <AsyncButton
                      size="sm"
                      variant="secondary"
                      className="min-h-11 min-w-11 rounded-l-none border-l"
                      disabled={shopLocked}
                      aria-label={
                        shopItem.isReserved ? 'Unreserve item' : 'Reserve item'
                      }
                      onAction={() =>
                        command({
                          type: 'toggle-reserve',
                          shopItemIndex: shopItem.index,
                        })
                      }
                    >
                      {shopItem.isReserved ? (
                        <Lock className="size-4 text-green-500" />
                      ) : (
                        <LockOpen className="size-4" />
                      )}
                    </AsyncButton>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </CardRow>

      <div className="flex flex-col items-center gap-2">
        {game.liveMatchId ? (
          <LiveMatchCard liveMatchId={game.liveMatchId} inGame />
        ) : (
          <AsyncButton
            className="min-h-11 min-w-32"
            onAction={() => command({ type: 'fight' })}
          >
            Fight
          </AsyncButton>
        )}
        <CraftingClient
          view={view}
          catalog={catalog}
          command={command}
          disabled={shopLocked}
        />
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-center text-lg font-semibold">Loadout</h2>
        <div className="flex flex-wrap items-start justify-center gap-3">
          {loadoutItems.map((item, index) => (
            <ItemCardClient
              key={`${item.name}-${index}`}
              itemData={item}
              catalog={catalog}
              size="160"
              onSell={
                item.name === 'hero' || shopLocked
                  ? undefined
                  : () =>
                      command({
                        type: 'sell',
                        itemName: item.name,
                        aspects: item.aspects,
                      })
              }
            />
          ))}
        </div>
      </div>
    </div>
  )
}
