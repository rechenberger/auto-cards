'use client'

import { CardRow } from '@/components/game/CardRow'
import { HandDisplay } from '@/components/game/HandDisplay'
import { invalidateGame } from '@/client/api/games'
import { useLiveMatch } from '@/client/api/liveMatches'
import { LiveMatchCard } from '@/components/game/LiveMatchCard'
import { RarityWeightsDisplay } from '@/components/game/RarityWeightsDisplay'
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
import { ArrowRight, Info, Lock, LockOpen, RotateCw } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { CraftingClient } from './CraftingClient'
import { GameMatchBoardClient } from './GameMatchBoardClient'
import { ItemCardClient } from './ItemCardClient'
import { LoadoutInfoClient } from './LoadoutInfoClient'

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
  const nextRound = getRoundStats(game.version)[game.data.roundNo + 1]

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-col items-center justify-center gap-2 md:flex-row">
        <StatsDisplay
          stats={{ gold: game.data.gold, space: stats.space }}
          showZero
        />
        <div className="flex-1" />
        <div className="flex items-center gap-1">
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
              <div className="flex flex-col gap-2">
                <div className="text-center font-semibold">
                  Round {game.data.roundNo + 1}
                </div>
                {currentRound && (
                  <div className="rounded-md bg-border px-4 py-2">
                    <div className="mb-1 text-center font-bold">
                      Shop Chances
                    </div>
                    <RarityWeightsDisplay
                      rarityWeights={currentRound.rarityWeights}
                    />
                  </div>
                )}
                {nextRound && (
                  <div className="flex flex-col items-center gap-2 rounded-md bg-border px-4 py-2">
                    <div className="text-center">Next Round Gain</div>
                    <StatsDisplay stats={{ gold: nextRound.gold }} />
                    {nextRound.experience > 0 && (
                      <div className="text-xs text-muted-foreground">
                        +{nextRound.experience} experience
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex-1" />
        {!specialBuyRound && (
          <AsyncButton
            variant="outline"
            disabled={shopLocked || game.data.gold < 1}
            className={cn('min-h-11 gap-2', game.data.gold < 1 && 'grayscale')}
            aria-label="Reroll shop for 1 gold"
            onAction={() => command({ type: 'reroll' })}
          >
            <RotateCw className="size-4" aria-hidden="true" />
            <StatsDisplay disableTooltip stats={{ gold: 1 }} />
          </AsyncButton>
        )}
      </div>

      <div className="max-w-full self-center">
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
                  'flex flex-col items-center justify-start gap-2 pb-2',
                  shopItem.isSold && 'grayscale opacity-50',
                )}
              >
                <ItemCardClient
                  itemData={shopItem}
                  catalog={catalog}
                  shopState={shopItem}
                  size="160"
                  onlyTop={false}
                />
                {!shopItem.isSold && (
                  <div className="flex items-stretch">
                    <AsyncButton
                      size="sm"
                      variant="secondary"
                      disabled={shopLocked || game.data.gold < price}
                      className={cn(
                        'min-h-11 gap-1',
                        !shopItem.isSpecial && 'rounded-r-none',
                        game.data.gold < price && 'grayscale',
                      )}
                      aria-label={`Buy ${item.name} for ${price} gold`}
                      onAction={() =>
                        command({ type: 'buy', shopItemIndex: shopItem.index })
                      }
                    >
                      {shopItem.isOnSale && (
                        <div className="relative -mx-1 -my-2 scale-75">
                          <div className="grayscale">
                            <StatsDisplay
                              stats={{ gold: item.price }}
                              showZero
                              disableTooltip
                            />
                          </div>
                          <div className="absolute -left-3 -top-2.5 -rotate-[24deg] text-xs font-black text-red-500">
                            SALE
                          </div>
                          <div className="absolute inset-x-0 top-1/2 -rotate-[24deg] border-y border-red-500" />
                        </div>
                      )}
                      <StatsDisplay
                        stats={{ gold: price }}
                        showZero
                        disableTooltip
                      />
                    </AsyncButton>
                    {!shopItem.isSpecial && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AsyncButton
                            size="sm"
                            variant="secondary"
                            className={cn(
                              'min-h-11 min-w-11 rounded-l-none border-l',
                              shopItem.isReserved && 'text-green-500',
                            )}
                            disabled={shopLocked}
                            aria-label={
                              shopItem.isReserved
                                ? 'Unreserve item'
                                : 'Reserve item'
                            }
                            onAction={() =>
                              command({
                                type: 'toggle-reserve',
                                shopItemIndex: shopItem.index,
                              })
                            }
                          >
                            {shopItem.isReserved ? (
                              <Lock
                                className="size-3"
                                strokeWidth={3}
                                aria-hidden="true"
                              />
                            ) : (
                              <LockOpen
                                className="size-3"
                                strokeWidth={3}
                                aria-hidden="true"
                              />
                            )}
                          </AsyncButton>
                        </TooltipTrigger>
                        <TooltipContent>
                          {shopItem.isReserved
                            ? 'Item is reserved. Click again to unreserve it.'
                            : 'Reserve item for later purchase.'}
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </CardRow>
      </div>

      <div className="flex-1" />

      <div className="flex flex-col items-center gap-2 self-center">
        {game.liveMatchId ? (
          <LiveMatchCard liveMatchId={game.liveMatchId} inGame />
        ) : (
          <AsyncButton
            className="min-h-11 min-w-32"
            onAction={() => command({ type: 'fight' })}
          >
            Fight
            <ArrowRight className="ml-2 size-4" aria-hidden="true" />
          </AsyncButton>
        )}
        <CraftingClient
          view={view}
          catalog={catalog}
          command={command}
          disabled={shopLocked}
        />
      </div>

      <div className="flex-1" />

      <div className="xl:hidden">
        <CardRow>
          {loadoutItems.map((item, index) => (
            <ItemCardClient
              key={`${item.name}-${index}`}
              itemData={item}
              catalog={catalog}
              size="160"
              onlyTop={false}
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
        </CardRow>
      </div>

      <div className="max-xl:hidden motion-reduce:[&_.transition-all]:transition-none">
        <HandDisplay>
          {loadoutItems.map((item, index) => (
            <ItemCardClient
              key={`${item.name}-${index}`}
              itemData={item}
              catalog={catalog}
              size="240"
              onlyTop={false}
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
        </HandDisplay>
      </div>

      <div className="flex flex-col items-center">
        <LoadoutInfoClient
          loadout={game.data.currentLoadout}
          catalog={catalog}
          stats={stats}
        />
      </div>
    </div>
  )
}
