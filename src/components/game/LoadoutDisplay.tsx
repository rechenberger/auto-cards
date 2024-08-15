import { Game } from '@/db/schema-zod'
import { getItemByName } from '@/game/allItems'
import { calcStats } from '@/game/calcStats'
import { allTags } from '@/game/tags'
import { countBy, first, indexOf, map, orderBy } from 'lodash-es'
import { Fragment } from 'react'
import { CardRow } from './CardRow'
import { HandDisplay } from './HandDisplay'
import { ItemCard } from './ItemCard'
import { StatsDisplay } from './StatsDisplay'

export const LoadoutDisplay = async ({ game }: { game: Game }) => {
  const stats = await calcStats({ loadout: game.data.currentLoadout })

  const itemsGrouped = countBy(game.data.currentLoadout.items, 'name')
  let items = await Promise.all(
    map(itemsGrouped, async (count, itemName) => ({
      name: itemName,
      count,
      item: await getItemByName(itemName),
    })),
  )
  items = orderBy(
    items,
    (i) => indexOf(allTags, first(i.item.tags) ?? 'default'),
    'asc',
  )

  return (
    <>
      <div className="xl:hidden">
        <CardRow>
          {map(items, (item) => (
            <Fragment key={item.name}>
              <ItemCard game={game} name={item.name} count={item.count} />
            </Fragment>
          ))}
        </CardRow>
      </div>
      <div className="max-xl:hidden">
        <HandDisplay>
          {map(items, (item) => (
            <Fragment key={item.name}>
              <ItemCard
                game={game}
                name={item.name}
                count={item.count}
                size="240"
              />
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
