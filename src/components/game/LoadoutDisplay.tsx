import { Game } from '@/db/schema-zod'
import { LoadoutData } from '@/game/LoadoutData'
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
          {map(items, (item, idx) => (
            <Fragment key={idx}>
              <ItemCard
                itemData={item}
                game={game}
                tooltipOnClick
                canSell={canSell}
                size="160"
              />
            </Fragment>
          ))}
        </CardRow>
      </div>
      <div className="max-xl:hidden">
        <ErrorBoundary>
          <HandDisplay>
            {map(items, (item, idx) => (
              <Fragment key={idx}>
                <ItemCard
                  itemData={item}
                  game={game}
                  size="240"
                  tooltipOnClick
                  canSell={canSell}
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
