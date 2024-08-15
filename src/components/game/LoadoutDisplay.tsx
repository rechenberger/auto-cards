import { Game } from '@/db/schema-zod'
import { calcStats } from '@/game/calcStats'
import { countBy, map } from 'lodash-es'
import { Fragment } from 'react'
import { CardRow } from './CardRow'
import { HandDisplay } from './HandDisplay'
import { ItemCard } from './ItemCard'
import { StatsDisplay } from './StatsDisplay'

export const LoadoutDisplay = async ({ game }: { game: Game }) => {
  const stats = await calcStats({ loadout: game.data.currentLoadout })

  const itemsGrouped = countBy(game.data.currentLoadout.items, 'name')
  return (
    <>
      <div className="xl:hidden">
        <CardRow>
          {map(itemsGrouped, (count, itemName) => (
            <Fragment key={itemName}>
              <ItemCard game={game} name={itemName} count={count} />
            </Fragment>
          ))}
        </CardRow>
      </div>
      <div className="max-xl:hidden">
        <HandDisplay>
          {map(itemsGrouped, (count, itemName) => (
            <Fragment key={itemName}>
              <ItemCard game={game} name={itemName} count={count} size="240" />
            </Fragment>
          ))}
        </HandDisplay>
      </div>

      <div className="flex flex-col items-center">
        <StatsDisplay stats={stats} showZero />
      </div>
    </>
  )
}
