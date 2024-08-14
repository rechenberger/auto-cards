import { Game } from '@/db/schema-zod'
import { calcStats } from '@/game/calcStats'
import { Fragment } from 'react'
import { ItemCard } from './ItemCard'
import { StatsDisplay } from './StatsDisplay'

export const LoadoutDisplay = async ({ game }: { game: Game }) => {
  const stats = await calcStats({ loadout: game.data.currentLoadout })
  return (
    <>
      <div className="grid grid-cols-5 gap-4">
        {game.data.currentLoadout.items.map((item, idx) => (
          <Fragment key={idx}>
            <ItemCard game={game} name={item.name} />
          </Fragment>
        ))}
      </div>

      <div className="flex flex-col items-center">
        <StatsDisplay stats={stats} />
      </div>
    </>
  )
}
