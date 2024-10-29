import { SimpleParamSelect } from '@/components/simple/SimpleParamSelect'
import { buttonVariants } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Game } from '@/db/schema-zod'
import { getAllItems } from '@/game/allItems'
import { countifyItems } from '@/game/countifyItems'
import { gameAction } from '@/game/gameAction'
import { orderItems } from '@/game/orderItems'
import { allRarities } from '@/game/rarities'
import { cn } from '@/lib/utils'
import { ActionButton } from '@/super-action/button/ActionButton'
import { ActionWrapper } from '@/super-action/button/ActionWrapper'
import { orderBy } from 'lodash-es'
import { Star } from 'lucide-react'
import { redirect } from 'next/navigation'
import { Fragment } from 'react'
import { ItemCard } from '../ItemCard'
import { StatsDisplay } from '../StatsDisplay'
import { CollectorLoadoutCheck } from './CollectorLoadoutCheck'
import { checkCollectorLoadout } from './checkCollectorLoadout'

export const CollectorItemGrid = async ({
  game,
  searchParams,
}: {
  game: Game
  searchParams: Promise<{
    tab?: 'loadout' | 'inventory' | 'favorites'
    order?: 'rarity' | 'category'
  }>
}) => {
  let loadoutItems = game.data.currentLoadout.items

  let inventoryItems = game.data.inventory?.items ?? []

  // const baseItems = loadoutItems.filter((item) => !item.id)

  const { tab = 'loadout', order = 'rarity' } = await searchParams

  let itemsShown = tab === 'loadout' ? loadoutItems : inventoryItems

  const hasAnyFavorite = inventoryItems.some((item) => item.favorite)
  if (tab === 'favorites') {
    itemsShown = itemsShown.filter((item) => item.favorite)
    if (!itemsShown.length) {
      redirect(`/game/${game.id}`)
    }
  }

  itemsShown = orderBy(itemsShown, (item) => item.name)
  itemsShown = countifyItems(await orderItems(itemsShown))

  if (order === 'rarity') {
    itemsShown = orderBy(itemsShown, (item) =>
      item.rarity ? -1 * allRarities.indexOf(item.rarity) : -Infinity,
    )
  }

  const check = await checkCollectorLoadout({
    loadout: game.data.currentLoadout,
  })

  const allItems = await getAllItems()

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col xl:flex-row gap-2">
          <SimpleParamSelect
            paramKey="tab"
            component="tabs"
            options={[
              { value: null, label: 'Loadout' },
              ...(hasAnyFavorite
                ? [{ value: 'favorites', label: 'Favorites' }]
                : []),
              { value: 'inventory', label: 'Inventory' },
            ]}
          />
          <div className="flex-1" />
          <CollectorLoadoutCheck game={game} />
          <SimpleParamSelect
            paramKey="order"
            component="dropdown"
            label="Order By"
            options={[
              { value: null, label: 'By Rarity' },
              { value: 'category', label: 'By Category' },
            ]}
          />
        </div>
        <div
          className={cn(
            'flex-1 flex flex-row flex-wrap gap-x-2 gap-y-6 justify-center items-start',
          )}
        >
          {itemsShown.map((item, idx) => {
            const selectable = item.id
            const inLoadout = selectable
              ? loadoutItems.some((i) => i.id === item.id)
              : true
            const tooMany =
              inLoadout && check.countTooMany.some((i) => i.name === item.name)
            const itemDef = allItems.find((i) => i.name === item.name)
            return (
              <Fragment key={idx}>
                <div
                  className={cn(
                    'flex flex-col items-center gap-2',
                    tooMany && 'ring ring-red-500 rounded-md',
                  )}
                >
                  <ItemCard
                    itemData={item}
                    size={tab === 'inventory' ? '120' : '160'}
                    onlyTop
                    tooltipOnClick
                    tooltipOnHover
                    // showPrice
                    priceAsWeight
                  />
                  <div
                    className={cn(
                      'flex flex-row gap-1',
                      !selectable && 'invisible',
                    )}
                  >
                    <ActionWrapper
                      catchToast
                      disabled={!selectable}
                      action={async () => {
                        'use server'
                        return gameAction({
                          gameId: game.id,
                          action: async ({ ctx }) => {
                            if (!selectable) {
                              throw new Error('Item is not selectable')
                            }
                            if (inLoadout) {
                              ctx.game.data.currentLoadout.items =
                                ctx.game.data.currentLoadout.items.filter(
                                  (i) => i.id !== item.id,
                                )
                            } else {
                              ctx.game.data.currentLoadout.items.push(item)
                            }
                          },
                        })
                      }}
                    >
                      <div
                        className={cn(
                          buttonVariants({ variant: 'secondary', size: 'sm' }),
                          'flex flex-row gap-2 items-center cursor-pointer',
                          !inLoadout && 'grayscale opacity-50',
                          'text-xs',
                          'rounded-r-none',
                        )}
                      >
                        <Checkbox checked={inLoadout} />
                        {!!itemDef?.price && (
                          <StatsDisplay
                            stats={{ weight: itemDef.price }}
                            showZero
                            size="sm"
                          />
                        )}
                      </div>
                    </ActionWrapper>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <ActionButton
                          variant={'secondary'}
                          disabled={!selectable}
                          size="sm"
                          className={cn(
                            item.favorite && 'text-yellow-500',
                            !item.favorite && 'grayscale opacity-50',
                            'rounded-l-none',
                          )}
                          icon={<Star />}
                          action={async () => {
                            'use server'
                            return gameAction({
                              gameId: game.id,
                              action: async ({ ctx }) => {
                                const allItems = [
                                  ...ctx.game.data.currentLoadout.items,
                                  ...(ctx.game.data.inventory?.items ?? []),
                                ]
                                for (const i of allItems) {
                                  if (i.id === item.id) {
                                    i.favorite = !item.favorite
                                  }
                                }
                              },
                            })
                          }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        {item.favorite
                          ? 'Remove from favorites'
                          : 'Add to favorites'}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </Fragment>
            )
          })}
        </div>
      </div>
    </>
  )
}
