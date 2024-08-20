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
  return (
    <>
      <div className="flex flex-row justify-end items-center rounded-xl">
        <ActionButton
          hideIcon
          catchToast
          variant="secondary"
          className="flex flex-row gap-1 items-center rounded-r-none"
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
                  title: 'Item sold',
                  description: `You bought ${capitalCase(
                    shopItem.name,
                  )} for ${price} gold`,
                })
              },
            })
          }}
        >
          {/* <div className="font-bold text-xs">BUY</div> */}
          <StatsDisplay stats={{ gold: price }} showZero disableTooltip />
          {shopItem.isOnSale && <div className="font-bold text-xs">SALE</div>}
        </ActionButton>
        <Tooltip>
          <TooltipTrigger>
            <ActionButton
              variant={'secondary'}
              size={'icon'}
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
                <Lock className="size-4" strokeWidth={3} />
              ) : (
                <LockOpen className="size-4" strokeWidth={3} />
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
