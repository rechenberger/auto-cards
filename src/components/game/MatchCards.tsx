import { Game } from '@/db/schema-zod'
import { LoadoutData } from '@/game/LoadoutData'
import { getItemByName } from '@/game/allItems'
import { countifyItems } from '@/game/countifyItems'
import { Changemakers } from '@/game/generateChangemakers'
import { orderItems } from '@/game/orderItems'
import { ThemeId, fallbackThemeId, getThemeDefinition } from '@/game/themes'
import { cn } from '@/lib/utils'
import { find, map, take } from 'lodash-es'
import { Fragment } from 'react'
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
              <div
                className={cn(
                  isBig && 'col-span-2 row-span-2',
                  isBig ? 'm-2 scale-[105%]' : 'm-1',
                  'relative',
                )}
              >
                <ItemCard
                  game={game}
                  itemData={item}
                  size={isBig ? '160' : '80'}
                  changemaker={changemaker}
                  tooltipOnClick
                  tooltipOnHover
                  themeId={themeId}
                  itemIdx={itemIdx}
                  sideIdx={sideIdx}
                  onlyTop
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
            </Fragment>
          )
        })}
      </div>
    </>
  )
}
