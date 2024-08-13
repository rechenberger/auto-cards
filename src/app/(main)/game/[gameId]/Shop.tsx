import { Game } from '@/db/schema-zod'
import { Fragment } from 'react'
import { ItemCard } from './ItemCard'

export const Shop = ({ game }: { game: Game }) => {
  return (
    <>
      <div className="grid grid-cols-5 gap-4">
        {game.data.shopItems.map((shopItem, idx) => (
          <Fragment key={idx}>
            <ItemCard name={shopItem.name} />
          </Fragment>
        ))}
      </div>
    </>
  )
}
