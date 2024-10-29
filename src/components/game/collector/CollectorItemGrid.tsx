import { SimpleParamSelect } from '@/components/simple/SimpleParamSelect'
import { buttonVariants } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Game } from '@/db/schema-zod'
import { getAllItems } from '@/game/allItems'
import { countifyItems } from '@/game/countifyItems'
import { gameAction } from '@/game/gameAction'
import { orderItems } from '@/game/orderItems'
import { allRarities } from '@/game/rarities'
import { cn } from '@/lib/utils'
import { ActionWrapper } from '@/super-action/button/ActionWrapper'
import { orderBy } from 'lodash-es'
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
  searchParams: Promise<{ tab?: 'inventory'; order?: 'rarity' | 'category' }>
}) => {
  let loadoutItems = game.data.currentLoadout.items

  let inventoryItems = game.data.inventory?.items ?? []

  // const baseItems = loadoutItems.filter((item) => !item.id)

  const { tab, order = 'rarity' } = await searchParams

  let itemsShown = tab === 'inventory' ? inventoryItems : loadoutItems
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
            'flex-1 flex flex-row flex-wrap gap-x-2 gap-y-8 justify-center items-start',
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
                    size={'160'}
                    onlyTop={false}
                    tooltipOnClick
                    // showPrice
                    priceAsWeight
                  />
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
                        !selectable && 'invisible',
                        !inLoadout && 'grayscale opacity-50',
                        'text-xs',
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
                </div>
              </Fragment>
            )
          })}
        </div>
      </div>
    </>
  )
}
