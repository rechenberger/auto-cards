import { Game, LoadoutData } from '@/db/schema-zod'
import { countifyItems } from '@/game/countifyItems'
import { orderItems } from '@/game/orderItems'
import { cn } from '@/lib/utils'
import { map } from 'lodash-es'
import { Fragment } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { ItemCard } from './ItemCard'

export const MatchCards = async ({
  items,
  game,
  sideIdx,
}: {
  items: LoadoutData['items']
  game?: Game
  sideIdx: number
}) => {
  items = countifyItems(items)
  items = await orderItems(items)

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 grid-flow-dense">
        {map(items, (item, itemIdx) => {
          const isBig = itemIdx === 2 || itemIdx === 3
          return (
            <Fragment key={item.name}>
              <Tooltip>
                <TooltipTrigger
                  className={cn(
                    isBig && 'col-span-2 row-span-2',
                    isBig ? 'm-2 scale-[105%]' : 'm-1',
                  )}
                >
                  <ItemCard
                    game={game}
                    name={item.name}
                    count={item.count}
                    size={isBig ? '160' : '80'}
                  />
                </TooltipTrigger>
                <TooltipContent
                  className="p-0 border-none bg-transparent"
                  side={sideIdx === 0 ? 'right' : 'left'}
                >
                  <ItemCard
                    game={game}
                    name={item.name}
                    count={item.count}
                    size="320"
                  />
                </TooltipContent>
              </Tooltip>
            </Fragment>
          )
        })}
      </div>
    </>
  )
}
