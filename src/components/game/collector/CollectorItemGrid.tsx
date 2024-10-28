import { Game } from '@/db/schema-zod'
import { countifyItems } from '@/game/countifyItems'
import { orderItems } from '@/game/orderItems'
import { cn } from '@/lib/utils'
import { Fragment } from 'react'
import { ItemCard } from '../ItemCard'

export const CollectorItemGrid = async ({ game }: { game: Game }) => {
  let items = game.data.currentLoadout.items
  items = countifyItems(await orderItems(items))

  return (
    <>
      <div
        className={cn(
          'flex-1 flex flex-row flex-wrap gap-1 justify-center items-start',
        )}
      >
        {items.map((item, idx) => (
          <Fragment key={idx}>
            <div className="relative">
              <ItemCard
                name={item.name}
                count={item.count}
                size={'160'}
                // onlyTop
                tooltipOnClick
                aspects={item.aspects}
              />
            </div>
          </Fragment>
        ))}
      </div>
    </>
  )
}
