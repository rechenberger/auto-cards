import { Game } from '@/db/schema-zod'
import { Fragment } from 'react'
import { ItemCard } from './ItemCard'

export const LoadoutView = ({ game }: { game: Game }) => {
  return (
    <>
      <div className="grid grid-cols-5 gap-4">
        {game.data.currentLoadout.items.map((item, idx) => (
          <Fragment key={idx}>
            <ItemCard game={game} name={item.name} />
          </Fragment>
        ))}
      </div>
    </>
  )
}
