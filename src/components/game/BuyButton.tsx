import { Game } from '@/db/schema-zod'
import { getItemByName } from '@/game/allItems'
import { calcStats, throwIfNegativeStats } from '@/game/calcStats'
import { gameAction } from '@/game/gameAction'
import { cn } from '@/lib/utils'
import { streamToast } from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { capitalCase } from 'change-case'
import { Lock, LockOpen } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { StatsDisplay } from './StatsDisplay'

export const BuyButton = async ({
  game,
  shopItem,
}: {
  game: Game
  shopItem: Game['data']['shopItems'][number] & {
    idx: number
  }
}) => {
  const item = await getItemByName(shopItem.name)

  let price = item.price
  if (shopItem?.isOnSale) {
    price = Math.ceil(price * 0.5)
  }

  const enoughGold = game.data.gold >= price

  return (
    <>
      <div className="flex flex-row justify-end items-center rounded-xl gap-0.5">
        <ActionButton
          hideIcon
          catchToast
          size="sm"
          variant="secondary"
          disabled={!enoughGold}
          className={cn(
            'flex flex-row gap-1 items-center rounded-r-none',
            !enoughGold && 'grayscale',
          )}
          action={async () => {
            'use server'
            return gameAction({
              gameId: game.id,
              action: async ({ ctx }) => {
                const game = ctx.game
                if (game.data.gold < price) {
                  throw new Error('Not enough gold')
                }
                game.data.gold -= price
                const s = game.data.shopItems[shopItem.idx]
                if (s.isSold) {
                  throw new Error('Already sold')
                }
                s.isSold = true
                s.isReserved = false

                const loadout = game.data.currentLoadout
                const itemInLoadout = loadout.items.find(
                  (i) => i.name === shopItem.name,
                )

                if (item.unique && itemInLoadout) {
                  throw new Error('You can only have a unique item once')
                }

                if (itemInLoadout) {
                  itemInLoadout.count = (itemInLoadout.count ?? 1) + 1
                } else {
                  loadout.items = [...loadout.items, { name: shopItem.name }]
                }
                const stats = await calcStats({
                  loadout: loadout,
                })
                throwIfNegativeStats({ stats })
                streamToast({
                  title: 'Item bought from shop',
                  description: `You bought ${capitalCase(
                    shopItem.name,
                  )} for ${price} gold`,
                })
              },
            })
          }}
        >
          {/* <div className="font-bold text-xs">BUY</div> */}
          <div className="flex flex-row gap-1 items-center">
            {shopItem.isOnSale && (
              <div className="flex flex-col items-center">
                {/* <div className="font-bold text-[10px] text-red-500 flex-1">
                  SALE
                </div> */}
                <div className="scale-75 -mx-1 -my-2 relative top-0.5">
                  <div className="grayscale">
                    <StatsDisplay
                      stats={{ gold: item.price }}
                      showZero
                      disableTooltip
                    />
                  </div>
                  <div className="absolute -top-2.5 -left-3 -rotate-[24deg] text-red-500 font-black text-xs">
                    SALE
                  </div>
                  <div className="border-y border-red-500 absolute inset-x-0 top-[50%] -rotate-[24deg]"></div>
                </div>
              </div>
            )}
            <StatsDisplay
              stats={{ gold: price }}
              showZero
              disableTooltip
              statClassName={
                cn()
                // shopItem.isOnSale && 'bg-green-500'
              }
            />
          </div>
        </ActionButton>
        <Tooltip>
          <TooltipTrigger>
            <ActionButton
              variant={'secondary'}
              size="sm"
              className={cn(
                shopItem.isReserved && 'text-green-500',
                'rounded-l-none',
              )}
              hideIcon
              action={async () => {
                'use server'
                return gameAction({
                  gameId: game.id,
                  action: async ({ ctx }) => {
                    const s = ctx.game.data.shopItems[shopItem.idx]
                    s.isReserved = !s.isReserved
                  },
                })
              }}
            >
              {shopItem.isReserved ? (
                <Lock className="size-3" strokeWidth={3} />
              ) : (
                <LockOpen className="size-3" strokeWidth={3} />
              )}
            </ActionButton>
            <TooltipContent>
              {shopItem.isReserved
                ? 'Item is reserved. Click again to un-reserve it'
                : 'Reserve item for later purchase'}
            </TooltipContent>
          </TooltipTrigger>
        </Tooltip>
      </div>
    </>
  )
}
