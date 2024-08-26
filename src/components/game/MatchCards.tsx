import { Game, LoadoutData } from '@/db/schema-zod'
import { countifyItems } from '@/game/countifyItems'
import { orderItems } from '@/game/orderItems'
import { map } from 'lodash-es'
import { Fragment } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { CardRow } from './CardRow'
import { ItemCard } from './ItemCard'

export const MatchCards = async ({
  items,
  game,
}: {
  items: LoadoutData['items']
  game?: Game
}) => {
  items = countifyItems(items)
  items = await orderItems(items)

  return (
    <>
      <div>
        <CardRow>
          {map(items, (item) => (
            <Fragment key={item.name}>
              <Tooltip>
                <TooltipTrigger>
                  <ItemCard
                    game={game}
                    name={item.name}
                    count={item.count}
                    size="80"
                  />
                </TooltipTrigger>
                <TooltipContent className="p-0 border-none bg-transparent">
                  <ItemCard
                    game={game}
                    name={item.name}
                    count={item.count}
                    size="320"
                  />
                </TooltipContent>
              </Tooltip>
            </Fragment>
          ))}
        </CardRow>
      </div>
    </>
  )
}
