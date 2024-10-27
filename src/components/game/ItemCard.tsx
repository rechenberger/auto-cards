import { Game } from '@/db/schema-zod'
import { getItemByName } from '@/game/allItems'
import { getAspectDef, ItemAspect, itemAspectsToTriggers } from '@/game/aspects'
import { Changemaker } from '@/game/generateChangemakers'
import { getRarityDefinition } from '@/game/rarities'
import { getTagDefinition } from '@/game/tags'
import {
  defaultThemeId,
  fallbackThemeId,
  getThemeDefinition,
  ThemeId,
} from '@/game/themes'
import { fontHeading, fontLore } from '@/lib/fonts'
import { cn } from '@/lib/utils'
import { ActionWrapper } from '@/super-action/button/ActionWrapper'
import { capitalCase } from 'change-case'
import { first } from 'lodash-es'
import { Fragment } from 'react'
import { AiItemImage } from '../ai/AiItemImage'
import { getMyUserThemeIdWithFallback } from './getMyUserThemeId'
import { ItemCardChip } from './ItemCardChip'
import { ItemSellButton } from './ItemSellButton'
import { ShopEffectDisplay } from './ShopEffectDisplay'
import { StatsBars } from './StatsBars'
import { StatsDisplay } from './StatsDisplay'
import { streamItemCard } from './streamItemCard'
import { TriggerDisplay } from './TriggerDisplay'

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
  onlyTop?: boolean
  disableTooltip?: boolean
  disableLinks?: boolean
  showPrice?: boolean
  aspects?: ItemAspect[]
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
    onlyTop,
    disableTooltip,
    disableLinks,
    showPrice,
    aspects,
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

  const aspectTriggers = aspects ? itemAspectsToTriggers(aspects) : []

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
          onlyTop && 'h-[320px]',
          'p-2',
          'bg-[#313130] text-white',
          'shadow-lg',
          'relative',
          'flex flex-col gap-1',
          // 'overflow-hidden',
          'group',
          size === '80' && [
            'scale-[25%] -mx-[120px] -my-[187.5px]',
            onlyTop && '-my-[120px]',
          ],
          size === '160' && [
            'scale-[50%] -mx-[80px] -my-[125px]',
            onlyTop && '-my-[80px]',
          ],
          size === '200' && [
            'scale-[62.5%] -mx-[60px] -my-[93.75px]',
            onlyTop && '-my-[60px]',
          ], // (500-500/1.6)/2 = 93.75
          size === '240' && [
            'scale-[75%] -mx-[40px] -my-[62.5px]',
            onlyTop && '-my-[40px]',
          ], // (500-500*0,75)/2 = 62.5
          size === '480' && [
            'lg:scale-[150%] lg:mx-[80px] lg:my-[125px]',
            onlyTop && 'lg:my-[80px]',
          ], // (500-500*1,5)/2 = 15
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
            <div className="absolute top-0 inset-x-0 gap-2 flex flex-col items-start">
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
                <ItemCardChip>
                  {item.tags?.map((t) => capitalCase(t)).join(', ')}
                </ItemCardChip>
              )}
              {!!rarity && (
                <ItemCardChip className={rarity.textClass}>
                  {capitalCase(rarity.name)}
                </ItemCardChip>
              )}
              {!!item.unique && (
                <ItemCardChip className="text-emerald-500">Unique</ItemCardChip>
              )}
              {item.sellPrice === 0 && (
                <ItemCardChip className="text-red-500">Unsellable</ItemCardChip>
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
              <div className="absolute inset-0 flex flex-col items-center justify-start py-16">
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
        {!onlyTop && (
          <div
            className={cn(
              'flex-1 flex flex-col justify-center rounded-lg p-2 text-xs relative',
              tag.bgClass,
              tag.bgClass && 'border-2 border-black',
              theme.classBottom,
            )}
          >
            <div className="absolute -top-8 inset-x-2 gap-2 flex flex-col items-start">
              {showPrice && !!item.price && (
                <StatsDisplay
                  size="sm"
                  stats={{ gold: item.price }}
                  className={cn(theme.classBottom)}
                />
              )}
            </div>
            <div className="flex flex-col items-center gap-2">
              {item.stats && (
                <StatsDisplay
                  size="sm"
                  relative
                  stats={item.stats}
                  disableTooltip={disableTooltip}
                  canWrap
                />
              )}
              {item.statsItem?.healthMax && (
                <StatsBars stats={item.statsItem} />
              )}
              {item.statsItem && (
                <div className="flex flex-row gap-2 items-center">
                  <div>Item:</div>
                  <StatsDisplay
                    size="sm"
                    relative
                    stats={item.statsItem}
                    disableTooltip={disableTooltip}
                    canWrap
                    hideBars
                  />
                </div>
              )}
              {item.triggers?.map((trigger, idx) => (
                <Fragment key={idx}>
                  <TriggerDisplay
                    trigger={trigger}
                    itemIdx={itemIdx}
                    sideIdx={sideIdx}
                    triggerIdx={idx}
                    disableTooltip={disableTooltip}
                    disableLinks={disableLinks}
                  />
                </Fragment>
              ))}
              {!!aspects?.length && (
                <div className="flex flex-row gap-1 p-1 rounded-lg">
                  {aspects?.map((aspect, idx) => {
                    const aspectDef = getAspectDef(aspect.name)
                    const { power } = aspect
                    const value = aspectDef.value({ power })
                    // const valueMin = aspectDef.value({ power: 0 })
                    const valueMax = aspectDef.value({ power: 1 })
                    const valuePercent = value / valueMax
                    const triggers = aspectDef.triggers({ power, value })
                    return (
                      <Fragment key={idx}>
                        {triggers?.map((trigger, idx) => (
                          <Fragment key={idx}>
                            <TriggerDisplay
                              trigger={trigger}
                              itemIdx={itemIdx}
                              sideIdx={sideIdx}
                              triggerIdx={idx}
                              disableTooltip={disableTooltip}
                              disableLinks={disableLinks}
                              className={cn(
                                'min-w-min p-1 rounded-xl',
                                'relative overflow-hidden z-10',
                                // aspect.power > 0.8
                                //   ? 'ring ring-yellow-500'
                                //   : '',
                              )}
                            >
                              <div
                                className="absolute inset-y-0 left-0 bg-black/50 bg-opacity-100 -z-10"
                                style={{
                                  width: `${valuePercent * 100}%`,
                                }}
                              />
                            </TriggerDisplay>
                          </Fragment>
                        ))}
                      </Fragment>
                    )
                  })}
                </div>
              )}
              {item.shopEffects?.map((shopEffect, idx) => (
                <Fragment key={idx}>
                  <ShopEffectDisplay
                    shopEffect={shopEffect}
                    disableLinks={disableLinks}
                  />
                </Fragment>
              ))}
              {item.description && (
                <div className="flex flex-row gap-2 items-center">
                  <div className={cn(fontLore.className)}>
                    {item.description}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* </HoverCardTrigger>
        <HoverCardContent>
          <div className="flex flex-col gap-4">
            {item.stats && <StatsDisplay
            size="sm" relative stats={item.stats} />}
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
        <ActionWrapper
          action={async () => {
            'use server'
            return streamItemCard({ ...props, onlyTop: false })
          }}
        >
          <div className="cursor-pointer flex">{inner}</div>
        </ActionWrapper>
      </>
    )
  }

  return inner
}
