import { Game } from '@/db/schema-zod'
import { gameAction } from '@/game/gameAction'
import { generateShopItems } from '@/game/generateShopItems'
import { ActionButton } from '@/super-action/button/ActionButton'
import { Fragment } from 'react'
import { ItemCard } from './ItemCard'

export const Shop = ({ game }: { game: Game }) => {
  const priceToReroll = 1 // TODO: make this dynamic
  return (
    <>
      <div className="grid grid-cols-5 gap-4">
        {game.data.shopItems.map((shopItem, idx) => (
          <Fragment key={idx}>
            <ItemCard
              game={game}
              name={shopItem.name}
              shopItem={{ ...shopItem, idx }}
            />
          </Fragment>
        ))}
      </div>
      <div className="flex flex-row gap-2 justify-center items-center">
        <div>${game.data.gold}</div>
        <ActionButton
          catchToast
          action={async () => {
            'use server'
            return gameAction({
              gameId: game.id,
              action: async ({ ctx }) => {
                ctx.game.data.gold += 10
              },
            })
          }}
        >
          +${10}
        </ActionButton>
        <ActionButton
          catchToast
          action={async () => {
            'use server'
            return gameAction({
              gameId: game.id,
              action: async ({ ctx }) => {
                const { game } = ctx
                game.data.shopRerolls += 1
                if (game.data.gold < priceToReroll) {
                  throw new Error('not enough gold')
                }
                game.data.gold -= priceToReroll
                game.data.shopItems = await generateShopItems({ game })
              },
            })
          }}
        >
          reroll (${priceToReroll})
        </ActionButton>
      </div>
    </>
  )
}
