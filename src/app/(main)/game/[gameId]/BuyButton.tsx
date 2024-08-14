import { Game } from '@/db/schema-zod'
import { calcStats, throwIfNegativeStats } from '@/game/calcStats'
import { gameAction } from '@/game/gameAction'
import { ItemDefinition } from '@/game/zod-schema'
import { streamToast } from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { capitalCase } from 'change-case'

export const BuyButton = ({
  game,
  shopItem,
}: {
  game: Game
  shopItem: Game['data']['shopItems'][number] & {
    idx: number
    item: ItemDefinition
  }
}) => {
  let price = shopItem.item.price
  if (shopItem?.isOnSale) {
    price = Math.ceil(price * 0.5)
  }
  return (
    <>
      <ActionButton
        hideIcon
        catchToast
        disabled={shopItem.isSold}
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
              loadout.items = [...loadout.items, { name: shopItem.name }]
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
        ${price}
        {shopItem.isOnSale && ' (SALE)'}
      </ActionButton>
    </>
  )
}
