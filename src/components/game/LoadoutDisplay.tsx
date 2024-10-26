import { Game, LoadoutData } from '@/db/schema-zod'
import { calcStats } from '@/game/calcStats'
import { countifyItems } from '@/game/countifyItems'
import { orderItems } from '@/game/orderItems'
import ErrorBoundary from '@/lib/ErrorBoundary'
import { map } from 'lodash-es'
import { Fragment } from 'react'
import { CardRow } from './CardRow'
import { HandDisplay } from './HandDisplay'
import { ItemCard } from './ItemCard'
import { LoadoutInfoButton } from './LoadoutInfoButton'

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
                size="160"
                aspects={item.aspects}
              />
            </Fragment>
          ))}
        </CardRow>
      </div>
      <div className="max-xl:hidden">
        <ErrorBoundary>
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
                  aspects={item.aspects}
                />
              </Fragment>
            ))}
          </HandDisplay>
        </ErrorBoundary>
      </div>

      <div className="flex flex-col items-center">
        <LoadoutInfoButton loadout={loadout} />
      </div>
    </>
  )
}
