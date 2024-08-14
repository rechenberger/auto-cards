import { Game } from '@/db/schema-zod'
import { generateShopItems } from '@/game/generateShopItems'
import { updateGame } from '@/game/updateGame'
import { superAction } from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { revalidatePath } from 'next/cache'
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
          action={async () => {
            'use server'
            return superAction(async () => {
              game.data.gold += 10
              await updateGame({
                game,
              })
              revalidatePath('/', 'layout')
            })
          }}
        >
          +${10}
        </ActionButton>
        <ActionButton
          action={async () => {
            'use server'
            return superAction(async () => {
              game.data.shopRerolls += 1
              if (game.data.gold < priceToReroll) {
                throw new Error('not enough gold')
              }
              game.data.gold -= priceToReroll
              game.data.shopItems = await generateShopItems({ game })
              await updateGame({
                game,
              })
              revalidatePath('/', 'layout')
            })
          }}
        >
          reroll (${priceToReroll})
        </ActionButton>
      </div>
    </>
  )
}
