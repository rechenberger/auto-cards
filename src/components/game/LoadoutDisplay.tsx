import { Game } from '@/db/schema-zod'
import { calcStats } from '@/game/calcStats'
import { countBy, map } from 'lodash-es'
import { Fragment } from 'react'
import { ItemCard } from './ItemCard'
import { StatsDisplay } from './StatsDisplay'

export const LoadoutDisplay = async ({ game }: { game: Game }) => {
  const stats = await calcStats({ loadout: game.data.currentLoadout })

  const itemsGrouped = countBy(game.data.currentLoadout.items, 'name')
  return (
    <>
      <div className="flex flex-row flex-wrap gap-2 justify-center">
        {map(itemsGrouped, (count, itemName) => (
          <Fragment key={itemName}>
            <ItemCard game={game} name={itemName} count={count} />
          </Fragment>
        ))}
      </div>

      <div className="flex flex-col items-center">
        <StatsDisplay stats={stats} showZero />
      </div>
    </>
  )
}
