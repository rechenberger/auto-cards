import { SimpleParamSelect } from '@/components/simple/SimpleParamSelect'
import { SimpleTooltip } from '@/components/simple/SimpleTooltip'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Game } from '@/db/schema-zod'
import { getAllItems } from '@/game/allItems'
import { countifyItems } from '@/game/countifyItems'
import { gameAction } from '@/game/gameAction'
import { orderItems } from '@/game/orderItems'
import { allRarities, allRarityDefinitions } from '@/game/rarities'
import { Tag, allTags } from '@/game/tags'
import { cn } from '@/lib/utils'
import { streamToast } from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { ActionWrapper } from '@/super-action/button/ActionWrapper'
import { capitalCase } from 'change-case'
import { filter, find, last, orderBy, reverse } from 'lodash-es'
import { ArrowUp, Recycle, Star } from 'lucide-react'
import { redirect } from 'next/navigation'
import { Fragment } from 'react'
import { ItemCard } from '../ItemCard'
import { StatsDisplay } from '../StatsDisplay'
import { TagDisplay } from '../TagDisplay'
import { CollectorLoadoutCheck } from './CollectorLoadoutCheck'
import { streamCollectorUpgradeDialog } from './CollectorUpgradeDialog'
import { checkCollectorLoadout } from './checkCollectorLoadout'

export const CollectorItemGrid = async ({
  game,
  searchParams,
}: {
  game: Game
  searchParams: Promise<{
    tab?: 'loadout' | 'inventory' | 'favorites' | 'workshop'
    order?: 'rarity' | 'category' | 'newest'
    tag?: Tag
  }>
}) => {
  let loadoutItems = game.data.currentLoadout.items

  let inventoryItems = game.data.inventory?.items ?? []

  // const baseItems = loadoutItems.filter((item) => !item.id)

  const { tab = 'loadout', order = 'rarity', tag } = await searchParams

  let itemsShown = tab === 'loadout' ? loadoutItems : inventoryItems

  const favoriteItems = inventoryItems.filter((item) => item.favorite)
  const hasAnyFavorite = favoriteItems.length > 0
  if (tab === 'favorites') {
    itemsShown = favoriteItems
    if (!itemsShown.length) {
      redirect(`/game/${game.id}`)
    }
  }

  itemsShown = orderBy(itemsShown, (item) =>
    item.rarity ? -1 * allRarities.indexOf(item.rarity) : -Infinity,
  )
  itemsShown = orderBy(itemsShown, (item) => item.name)
  itemsShown = countifyItems(await orderItems(itemsShown))

  if (order === 'rarity') {
    itemsShown = orderBy(itemsShown, (item) =>
      item.rarity ? -1 * allRarities.indexOf(item.rarity) : -Infinity,
    )
  }

  if (order === 'newest') {
    itemsShown = orderBy(itemsShown, (item) => item.createdAt, 'desc')
  }

  const check = await checkCollectorLoadout({
    loadout: game.data.currentLoadout,
  })

  const allItems = await getAllItems()

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 xl:sticky top-0 z-10 bg-background py-2 -my-2">
          <div className="flex flex-col xl:flex-row gap-2 ">
            <SimpleParamSelect
              paramKey="tab"
              component="tabs"
              options={[
                { value: null, label: `Loadout (${loadoutItems.length})` },
                ...(hasAnyFavorite
                  ? [
                      {
                        value: 'favorites',
                        label: `Favorites (${favoriteItems.length})`,
                      },
                    ]
                  : []),
                {
                  value: 'inventory',
                  label: `Inventory (${inventoryItems.length})`,
                },
                {
                  value: 'workshop',
                  label: `Workshop`,
                },
              ]}
            />
            <div className="flex-1" />
            <CollectorLoadoutCheck game={game} />
            <SimpleParamSelect
              options={allTags.map((tag) => ({
                value: tag,
                label: <TagDisplay tag={tag} disableLinks />,
              }))}
              paramKey="tag"
              label="Tag"
              nullLabel="All Tags"
              component="dropdown"
            />
            <SimpleParamSelect
              paramKey="order"
              component="dropdown"
              label="Order By"
              options={[
                { value: null, label: 'By Rarity' },
                { value: 'category', label: 'By Category' },
                { value: 'newest', label: 'Newest' },
              ]}
            />
          </div>
          {tab === 'workshop' && (
            <>
              <div className="grid lg:grid-cols-5 gap-2">
                {reverse([...allRarityDefinitions]).map((rarity) => {
                  const itemIdsToSalvage = filter(
                    itemsShown,
                    (i) =>
                      i.rarity === rarity.name &&
                      !!i.id &&
                      !i.favorite &&
                      !find(loadoutItems, (li) => li.id === i.id),
                  ).flatMap((i) => (i.id ? [i.id] : []))
                  return (
                    <Fragment key={rarity.name}>
                      <Card className="px-2 py-1 text-sm">
                        <div
                          className={cn(
                            'flex flex-row gap-1 items-center',
                            rarity.textClass,
                          )}
                        >
                          <div className="flex-1 truncate">
                            {capitalCase(rarity.name)} Parts
                          </div>
                          <div className="text-right">
                            {game.data.salvagedParts?.[rarity.name] ?? 0}
                          </div>
                          <ActionButton
                            variant={'ghost'}
                            disabled={!itemIdsToSalvage.length}
                            size="sm"
                            className={cn(
                              'rounded-none first:rounded-l-md last:rounded-r-md',
                              'h-auto px-2 py-1',
                            )}
                            icon={<Recycle />}
                            catchToast
                            askForConfirmation={{
                              title: `Salvage ${itemIdsToSalvage.length} ${rarity.name} items?`,
                              content: `This will only salvage items that are not equipped and not favorites.`,
                            }}
                            action={async () => {
                              'use server'
                              return gameAction({
                                gameId: game.id,
                                action: async ({ ctx }) => {
                                  const ids = itemIdsToSalvage

                                  if (ctx.game.data.inventory) {
                                    ctx.game.data.inventory.items =
                                      ctx.game.data.inventory.items.filter(
                                        (i) => i.id && !ids.includes(i.id),
                                      )
                                  }
                                  ctx.game.data.currentLoadout.items =
                                    ctx.game.data.currentLoadout.items.filter(
                                      (i) => i.id && !ids.includes(i.id),
                                    )

                                  const salvagedParts =
                                    ctx.game.data.salvagedParts ?? {}
                                  salvagedParts[rarity.name] =
                                    (salvagedParts[rarity.name] ?? 0) +
                                    ids.length
                                  ctx.game.data.salvagedParts = salvagedParts

                                  streamToast({
                                    title: `Salvaged ${ids.length} ${rarity.name} items`,
                                    description: `You got ${ids.length} ${rarity.name} parts.`,
                                  })
                                },
                              })
                            }}
                          >
                            + {itemIdsToSalvage.length}
                          </ActionButton>
                        </div>
                      </Card>
                    </Fragment>
                  )
                })}
              </div>
            </>
          )}
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

            if (tag && !itemDef?.tags?.includes(tag)) {
              return null
            }
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
                          'rounded-none first:rounded-l-md last:rounded-r-md',
                          'h-auto px-2 py-1',
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
                    <SimpleTooltip
                      tooltip={
                        item.favorite
                          ? 'Remove from favorites'
                          : 'Add to favorites'
                      }
                    >
                      <ActionButton
                        variant={'secondary'}
                        disabled={!selectable}
                        size="sm"
                        className={cn(
                          item.favorite && 'text-yellow-500',
                          !item.favorite && 'grayscale opacity-50',
                          'rounded-none first:rounded-l-md last:rounded-r-md',
                          'h-auto px-2 py-1',
                        )}
                        icon={
                          <Star
                            fill={item.favorite ? 'currentColor' : undefined}
                          />
                        }
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
                    </SimpleTooltip>
                  </div>
                  {tab === 'workshop' && (
                    <div
                      className={cn(
                        'flex flex-row gap-1',
                        !selectable && 'invisible',
                      )}
                    >
                      {item.rarity !== last(allRarities) && (
                        <SimpleTooltip
                          tooltip={`Upgrade this item to increase its rarity and add a new random aspect. Costs 5 ${item.rarity} parts.`}
                        >
                          <ActionButton
                            variant={'secondary'}
                            disabled={!selectable}
                            size="sm"
                            className={cn(
                              'rounded-none first:rounded-l-md last:rounded-r-md',
                              'h-auto px-2 py-1',
                            )}
                            icon={<ArrowUp />}
                            catchToast
                            action={async () => {
                              'use server'
                              return gameAction({
                                gameId: game.id,
                                action: async ({ ctx }) => {
                                  streamCollectorUpgradeDialog({
                                    item,
                                    game: ctx.game,
                                  })
                                },
                              })
                            }}
                          />
                        </SimpleTooltip>
                      )}
                      <SimpleTooltip
                        tooltip={'Salvage this item to get some parts.'}
                      >
                        <ActionButton
                          variant={'secondary'}
                          disabled={!selectable}
                          size="sm"
                          className={cn(
                            'rounded-none first:rounded-l-md last:rounded-r-md',
                            'h-auto px-2 py-1',
                          )}
                          icon={<Recycle />}
                          askForConfirmation={
                            inLoadout
                              ? {
                                  title: `Salvage ${capitalCase(item.name)}?`,
                                  content: `It's currently in your loadout.`,
                                }
                              : item.favorite
                                ? {
                                    title: `Salvage ${capitalCase(item.name)}?`,
                                    content: `It's currently in your favorites.`,
                                  }
                                : undefined
                          }
                          catchToast
                          action={async () => {
                            'use server'
                            return gameAction({
                              gameId: game.id,
                              action: async ({ ctx }) => {
                                const { id, rarity } = item
                                if (!id || !rarity) {
                                  throw new Error('Cannot salvage this item')
                                }

                                if (ctx.game.data.inventory) {
                                  ctx.game.data.inventory.items =
                                    ctx.game.data.inventory.items.filter(
                                      (i) => i.id !== id,
                                    )
                                }
                                ctx.game.data.currentLoadout.items =
                                  ctx.game.data.currentLoadout.items.filter(
                                    (i) => i.id !== id,
                                  )

                                const salvagedParts =
                                  ctx.game.data.salvagedParts ?? {}
                                salvagedParts[rarity] =
                                  (salvagedParts[rarity] ?? 0) + 1
                                ctx.game.data.salvagedParts = salvagedParts

                                streamToast({
                                  title: `Salvaged ${rarity} item`,
                                  description: `You got 1 ${rarity} parts.`,
                                })
                              },
                            })
                          }}
                        />
                      </SimpleTooltip>
                    </div>
                  )}
                </div>
              </Fragment>
            )
          })}
        </div>
      </div>
    </>
  )
}
