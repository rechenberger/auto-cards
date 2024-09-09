import { Game, LoadoutData } from '@/db/schema-zod'
import { calcStats } from '@/game/calcStats'
import { countifyItems } from '@/game/countifyItems'
import { orderItems } from '@/game/orderItems'
import { map } from 'lodash-es'
import { Fragment } from 'react'
import { CardRow } from './CardRow'
import { HandDisplay } from './HandDisplay'
import { ItemCard } from './ItemCard'
import { StatsDisplay } from './StatsDisplay'

export const LoadoutDisplay = async ({
  game,
  loadout,
  canSell,
}: {
  game?: Game
  loadout: LoadoutData
  canSell?: boolean
}) => {
  const stats = await calcStats({ loadout })

  let items = countifyItems(loadout.items)
  items = await orderItems(items)

  return (
    <>
      <div className="xl:hidden">
        <CardRow>
          {map(items, (item) => (
            <Fragment key={item.name}>
              <ItemCard
                game={game}
                name={item.name}
                count={item.count}
                tooltipOnClick
                canSell={canSell}
              />
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
                tooltipOnClick
                canSell={canSell}
              />
            </Fragment>
          ))}
        </HandDisplay>
      </div>

      <div className="flex flex-col items-center">
        <StatsDisplay stats={stats} showZero canWrap />
      </div>
    </>
  )
}
