import { Game } from '@/db/schema-zod'
import { getItemByName } from '@/game/allItems'
import { Changemaker } from '@/game/generateChangemakers'
import { getRarityDefinition } from '@/game/rarities'
import { getTagDefinition } from '@/game/tags'
import {
  defaultThemeId,
  fallbackThemeId,
  getThemeDefinition,
  ThemeId,
} from '@/game/themes'
import { fontHeading } from '@/lib/fonts'
import { cn } from '@/lib/utils'
import { ActionButton } from '@/super-action/button/ActionButton'
import { capitalCase } from 'change-case'
import { first } from 'lodash-es'
import { Fragment } from 'react'
import { AiItemImage } from '../ai/AiItemImage'
import { ItemSellButton } from './ItemSellButton'
import { StatsDisplay } from './StatsDisplay'
import { TriggerDisplay } from './TriggerDisplay'
import { getMyUserThemeIdWithFallback } from './getMyUserThemeId'
import { streamItemCard } from './streamItemCard'

export type ItemCardProps = {
  game?: Game
  name: string
  shopItem?: Game['data']['shopItems'][number] & { idx: number }
  size?: '480' | '320' | '240' | '200' | '160' | '80'
  className?: string
  count?: number
  tooltipOnClick?: boolean
  changemaker?: Changemaker
  themeId?: ThemeId
  sideIdx?: number
  itemIdx?: number
  canSell?: boolean
}

export const ItemCard = async (props: ItemCardProps) => {
  let {
    game,
    name,
    shopItem,
    size = '200',
    className,
    count = 1,
    tooltipOnClick,
    changemaker,
    themeId,
    sideIdx,
    itemIdx,
    canSell,
  } = props

  const item = await getItemByName(name)
  const title = capitalCase(name)
  const tag = getTagDefinition(first(item.tags) ?? 'default')

  if (!themeId) {
    themeId = await getMyUserThemeIdWithFallback()
  } else {
    themeId = await fallbackThemeId(themeId)
  }

  const theme = await getThemeDefinition(themeId)

  const rarity = item.rarity ? getRarityDefinition(item.rarity) : undefined
  const gameId = game?.id

  const inner = (
    <>
      {/* <HoverCard>
        <HoverCardTrigger> */}
      <div
        className={cn(
          'dark',
          'shrink-0',
          'rounded-xl',
          'w-[320px] h-[500px]',
          'p-2',
          'bg-[#313130] text-white',
          'shadow-lg',
          'relative',
          'flex flex-col gap-1',
          // 'overflow-hidden',
          'group',
          size === '80' && 'scale-[25%] -mx-[120px] -my-[187.5px]',
          size === '160' && 'scale-[50%] -mx-[80px] -my-[125px]',
          size === '200' && 'scale-[62.5%] -mx-[60px] -my-[93.75px]', // (500-500/1.6)/2 = 93.75
          size === '240' && 'scale-[75%] -mx-[40px] -my-[62.5px]', // (500-500*0,75)/2 = 62.5
          size === '480' && 'lg:scale-[150%] lg:mx-[80px] lg:my-[125px]', // (500-500*1,5)/2 = 15
          'select-none',
          className,
        )}
      >
        {canSell && <ItemSellButton gameId={gameId} item={item} />}
        <div
          className={cn(
            'aspect-square relative rounded-tr-lg rounded-b-lg overflow-hidden bg-black',
            'text-white',
            // 'text-amber-400',
            'font-bold',
            '[text-shadow:_1px_1px_4px_rgb(0_0_0_/_80%)]',
            fontHeading.className,
            theme.classTop,
          )}
        >
          <div className="relative rounded-tr-lg rounded-b-lg overflow-hidden">
            <div className="absolute top-0 inset-x-0 flex flex-col items-start">
              <div
                className={cn(
                  'bg-[#313130] pl-4 pr-6 pb-1.5',
                  'rounded-br-[20px]',
                  'border-b-2 border-r-2 border-black',
                )}
              >
                {title}
              </div>
            </div>
            <div className="absolute top-6 inset-x-0 flex flex-col items-end gap-1">
              {!!item.tags?.length && (
                <div
                  className={cn(
                    'bg-[#313130] pl-4 pr-3 py-1',
                    'rounded-l-full',
                    'border-l-2 border-y-2 border-black',
                  )}
                >
                  <div className="text-xs">
                    {item.tags?.map((t) => capitalCase(t)).join(',')}
                  </div>
                </div>
              )}
              {!!rarity && (
                <div
                  className={cn(
                    'bg-[#313130] pl-4 pr-3 py-1',
                    'rounded-l-full',
                    'border-l-2 border-y-2 border-black',
                    rarity.textClass,
                  )}
                >
                  <div className="text-xs">{capitalCase(rarity.name)}</div>
                </div>
              )}
            </div>
            <div className="border-black border-2 rounded-lg overflow-hidden">
              <AiItemImage
                className="aspect-square"
                itemName={item.name}
                themeId={themeId ?? defaultThemeId}
              />
            </div>
          </div>
          {count >= 2 && (
            <>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-white rounded-full font-black px-8 py-2 text-6xl bg-black/80 -rotate-12 scale-150">
                  {count}x
                </div>
              </div>
            </>
          )}
          {!!shopItem?.isSold && (
            <>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-red-500 border-8 border-red-500 font-black px-8 py-2 text-3xl bg-black/80 -rotate-12 scale-150">
                  SOLD
                </div>
              </div>
            </>
          )}
          {!!shopItem?.isReserved && (
            <>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-green-500 border-8 border-green-500 font-black px-8 py-2 text-3xl bg-black/80 -rotate-12 scale-150">
                  RESERVED
                </div>
              </div>
            </>
          )}
        </div>
        <div
          className={cn(
            'flex-1 flex flex-col justify-center rounded-lg p-2',
            tag.bgClass,
            tag.bgClass && 'border-2 border-black',
            theme.classBottom,
          )}
        >
          <div className="flex flex-col items-center gap-2">
            {item.stats && <StatsDisplay relative stats={item.stats} />}
            {item.statsItem && (
              <div className="flex flex-row gap-2 items-center">
                <div>Item:</div>
                <StatsDisplay relative stats={item.statsItem} />
              </div>
            )}
            {item.triggers?.map((trigger, idx) => (
              <Fragment key={idx}>
                <TriggerDisplay
                  trigger={trigger}
                  itemIdx={itemIdx}
                  sideIdx={sideIdx}
                  triggerIdx={idx}
                />
              </Fragment>
            ))}
          </div>
        </div>
      </div>
      {/* </HoverCardTrigger>
        <HoverCardContent>
          <div className="flex flex-col gap-4">
            {item.stats && <StatsDisplay relative stats={item.stats} />}
            {item.triggers?.map((trigger, idx) => (
              <Fragment key={idx}>
                <TriggerDisplay trigger={trigger} />
              </Fragment>
            ))}
          </div>
        </HoverCardContent>
      </HoverCard> */}
    </>
  )

  if (tooltipOnClick) {
    return (
      <>
        <ActionButton
          component={'div' as any} // no button, so no invalid html, so no hydration errors
          className="cursor-pointer flex"
          hideIcon
          action={async () => {
            'use server'
            return streamItemCard({ ...props, count: 1 })
          }}
        >
          {inner}
        </ActionButton>
      </>
    )
  }

  return inner
}
