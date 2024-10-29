import { buttonVariants } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Game } from '@/db/schema-zod'
import { countifyItems } from '@/game/countifyItems'
import { gameAction } from '@/game/gameAction'
import { orderItems } from '@/game/orderItems'
import { cn } from '@/lib/utils'
import { ActionWrapper } from '@/super-action/button/ActionWrapper'
import { Fragment } from 'react'
import { ItemCard } from '../ItemCard'

export const CollectorItemGrid = async ({ game }: { game: Game }) => {
  let loadoutItems = game.data.currentLoadout.items
  loadoutItems = countifyItems(await orderItems(loadoutItems))

  let inventoryItems = game.data.inventory?.items ?? []
  inventoryItems = countifyItems(await orderItems(inventoryItems))

  const baseItems = loadoutItems.filter((item) => !item.id)

  const itemsShown = [...baseItems, ...inventoryItems]

  return (
    <>
      <div
        className={cn(
          'flex-1 flex flex-row flex-wrap gap-1 justify-center items-start',
        )}
      >
        {itemsShown.map((item, idx) => {
          const selectable = item.id
          const inLoadout = selectable
            ? loadoutItems.some((i) => i.id === item.id)
            : true
          return (
            <Fragment key={idx}>
              <div className="flex flex-col items-center gap-1">
                <ItemCard
                  itemData={item}
                  size={'160'}
                  onlyTop={false}
                  tooltipOnClick
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
                      buttonVariants({ variant: 'outline', size: 'sm' }),
                      'flex flex-row gap-1 items-center cursor-pointer',
                      !selectable && 'invisible',
                    )}
                  >
                    <Checkbox checked={inLoadout} />
                    {/* {inLoadout ? 'remove' : 'add'} */}
                  </div>
                </ActionWrapper>
              </div>
            </Fragment>
          )
        })}
      </div>
    </>
  )
}
