import { Game } from '@/db/schema-zod'
import { Fragment } from 'react'
import { ItemCard } from './ItemCard'
import { Shop } from './Shop'

export const ShopView = ({ game }: { game: Game }) => {
  return (
    <>
      <div className="flex-1 flex flex-col gap-4">
        <Shop game={game} />
        <div className="flex-1" />
        {/* <SimpleDataCard data={game} /> */}
        <div className="grid grid-cols-5 gap-4">
          {game.data.currentLoadout.items.map((item, idx) => (
            <Fragment key={idx}>
              <ItemCard game={game} name={item.name} />
            </Fragment>
          ))}
        </div>
      </div>
    </>
  )
}
