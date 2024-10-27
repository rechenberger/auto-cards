import { Game, LoadoutData } from '@/db/schema-zod'
import { getItemByName } from '@/game/allItems'
import { countifyItems } from '@/game/countifyItems'
import { Changemakers } from '@/game/generateChangemakers'
import { orderItems } from '@/game/orderItems'
import { ThemeId, fallbackThemeId, getThemeDefinition } from '@/game/themes'
import { cn } from '@/lib/utils'
import { find, map, take } from 'lodash-es'
import { Fragment } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { ItemCard } from './ItemCard'
import { MatchCardOverlay } from './MatchCardOverlay'
import { MatchCardTimer } from './MatchCardTimer'
import { getMyUserThemeIdWithFallback } from './getMyUserThemeId'

export const MatchCards = async ({
  items,
  game,
  sideIdx,
  changemakers,
  themeId,
}: {
  items: LoadoutData['items']
  game?: Game
  sideIdx: number
  changemakers?: Changemakers
  themeId?: ThemeId
}) => {
  items = countifyItems(items)
  items = await orderItems(items)

  const noOfChangemakers = items.length >= 7 ? 2 : 1
  const topChangemakers = take(changemakers?.[sideIdx], noOfChangemakers)

  if (!themeId) {
    themeId = await getMyUserThemeIdWithFallback()
  } else {
    themeId = await fallbackThemeId(themeId)
  }

  const theme = await getThemeDefinition(themeId)
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 grid-flow-dense">
        {map(items, async (item, itemIdx) => {
          const isBig = topChangemakers.some((c) => c.name === item.name)
          const changemaker = find(
            changemakers?.[sideIdx],
            (c) => c.name === item.name,
          )

          const itemByName = await getItemByName(item.name)
          const hasInterval = itemByName?.triggers?.some(
            (t) => t.type === 'interval',
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
                  asChild
                >
                  <div>
                    <ItemCard
                      game={game}
                      name={item.name}
                      count={item.count}
                      size={isBig ? '160' : '80'}
                      changemaker={changemaker}
                      tooltipOnClick
                      themeId={themeId}
                      itemIdx={itemIdx}
                      sideIdx={sideIdx}
                      onlyTop
                      aspects={item.aspects}
                    />
                    {hasInterval && (
                      <MatchCardTimer sideIdx={sideIdx} itemIdx={itemIdx} />
                    )}
                    <MatchCardOverlay
                      sideIdx={sideIdx}
                      itemIdx={itemIdx}
                      theme={theme}
                    />
                  </div>
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
                    themeId={themeId}
                    itemIdx={itemIdx}
                    sideIdx={sideIdx}
                    aspects={item.aspects}
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
