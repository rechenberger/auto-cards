import { Game } from '@/db/schema-zod'
import { updateGame } from '@/game/updateGame'
import { superAction } from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { revalidatePath } from 'next/cache'
import { Fragment } from 'react'
import { ItemCard } from './ItemCard'

export const Shop = ({ game }: { game: Game }) => {
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
      </div>
    </>
  )
}
