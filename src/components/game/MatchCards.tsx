import { Game, LoadoutData } from '@/db/schema-zod'
import { countifyItems } from '@/game/countifyItems'
import { Changemakers } from '@/game/generateChangemakers'
import { MatchReport } from '@/game/generateMatch'
import { orderItems } from '@/game/orderItems'
import { cn } from '@/lib/utils'
import { find, map, take } from 'lodash-es'
import { Fragment } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { ItemCard } from './ItemCard'
import { MatchCardOverlay } from './MatchCardOverlay'

export const MatchCards = async ({
  items,
  game,
  sideIdx,
  changemakers,
  matchReport,
}: {
  items: LoadoutData['items']
  game?: Game
  sideIdx: number
  changemakers?: Changemakers
  matchReport: MatchReport
}) => {
  items = countifyItems(items)
  items = await orderItems(items)

  const noOfChangemakers = items.length >= 7 ? 2 : 1
  const topChangemakers = take(changemakers?.[sideIdx], noOfChangemakers)

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 grid-flow-dense">
        {map(items, (item, itemIdx) => {
          const isBig = topChangemakers.some((c) => c.name === item.name)
          const changemaker = find(
            changemakers?.[sideIdx],
            (c) => c.name === item.name,
          )
          return (
            <Fragment key={item.name}>
              <Tooltip>
                <TooltipTrigger
                  className={cn(
                    isBig && 'col-span-2 row-span-2',
                    isBig ? 'm-2 scale-[105%]' : 'm-1',
                    'relative',
                  )}
                >
                  <ItemCard
                    game={game}
                    name={item.name}
                    count={item.count}
                    size={isBig ? '160' : '80'}
                  />
                  <MatchCardOverlay
                    sideIdx={sideIdx}
                    itemIdx={itemIdx}
                    matchReport={matchReport}
                  />
                </TooltipTrigger>
                <TooltipContent
                  className="p-0 border-none bg-transparent rounded-xl"
                  side={sideIdx === 0 ? 'right' : 'left'}
                >
                  <ItemCard
                    game={game}
                    name={item.name}
                    count={item.count}
                    size="320"
                  />

                  <div className="absolute -bottom-6 flex flex-col items-center inset-x-0">
                    {changemaker && (
                      <div className="bg-[#313130] text-white px-4 py-1 rounded-b-md">
                        Necessity: {Math.round(changemaker.necessity * 100)}%
                      </div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </Fragment>
          )
        })}
      </div>
    </>
  )
}
