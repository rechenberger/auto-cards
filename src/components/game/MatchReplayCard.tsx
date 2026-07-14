'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ThemeDefinitionDto } from '@/contracts/catalog'
import { ItemDefinition } from '@/game/ItemDefinition'
import { calcAspects } from '@/game/aspects'
import { getRarityDefinition } from '@/game/rarities'
import { getTagDefinition } from '@/game/tags'
import { fontHeading, fontLore } from '@/lib/fonts'
import { cn } from '@/lib/utils'
import { capitalCase } from 'change-case'
import { first } from 'lodash-es'
import { useState } from 'react'
import { ItemCardChip } from './ItemCardChip'
import { ItemData } from './ItemData'
import {
  MatchReplayShopEffectDisplay,
  MatchReplayTriggerDisplay,
} from './MatchReplayCardDetails'
import { StatsBars } from './StatsBars'
import { StatsDisplay } from './StatsDisplay'

export type MatchReplayCardProps = {
  itemData: ItemData
  item: ItemDefinition
  theme: ThemeDefinitionDto
  imageUrl?: string
  size?: '480' | '320' | '240' | '200' | '160' | '120' | '80'
  sideIdx?: number
  itemIdx?: number
  showPrice?: boolean
  priceAsWeight?: boolean
  disableTooltip?: boolean
  disableLinks?: boolean
  nonInteractive?: boolean
}

export const MatchReplayCardFrame = ({
  itemData,
  item,
  theme,
  imageUrl,
  size,
  sideIdx,
  itemIdx,
  showPrice,
  priceAsWeight,
  disableTooltip,
  disableLinks,
  nonInteractive,
  onlyTop,
}: MatchReplayCardProps & { onlyTop: boolean }) => {
  const title = capitalCase(itemData.name)
  const tag = getTagDefinition(first(item.tags) ?? 'default')
  const count = itemData.count ?? 1
  const rarityKey = itemData.rarity ?? item.rarity
  const rarity = rarityKey ? getRarityDefinition(rarityKey) : undefined
  const bgShowsRarity = Boolean(itemData.rarity)
  const aspects = itemData.aspects ? calcAspects(itemData.aspects) : []
  const tooltipsDisabled = nonInteractive || disableTooltip
  const linksDisabled = nonInteractive || disableLinks

  return (
    <div
      className={cn(
        'dark shrink-0 rounded-xl w-[320px] h-[500px] p-2',
        onlyTop && 'h-[320px]',
        'bg-[#313130] text-white shadow-lg relative flex flex-col gap-1 group',
        size === '80' && [
          'scale-[25%] -mx-[120px] -my-[187.5px]',
          onlyTop && '-my-[120px]',
        ],
        size === '160' && [
          'scale-[50%] -mx-[80px] -my-[125px]',
          onlyTop && '-my-[80px]',
        ],
        size === '120' && [
          'scale-[37.5%] -mx-[100px] -my-[150px]',
          onlyTop && '-my-[100px]',
        ],
        size === '200' && [
          'scale-[62.5%] -mx-[60px] -my-[93.75px]',
          onlyTop && '-my-[60px]',
        ],
        size === '240' && [
          'scale-[75%] -mx-[40px] -my-[62.5px]',
          onlyTop && '-my-[40px]',
        ],
        size === '480' && [
          'lg:scale-[150%] lg:mx-[80px] lg:my-[125px]',
          onlyTop && 'lg:my-[80px]',
        ],
        'select-none',
        nonInteractive && 'pointer-events-none',
        bgShowsRarity && rarity?.bgClass,
      )}
    >
      <div
        className={cn(
          'aspect-square relative rounded-tr-lg rounded-b-lg overflow-hidden bg-black',
          'text-white font-bold [text-shadow:_1px_1px_4px_rgb(0_0_0_/_80%)]',
          fontHeading.className,
          theme.classTop,
        )}
      >
        <div className="relative rounded-tr-lg rounded-b-lg overflow-hidden">
          <div className="absolute top-0 inset-x-0 gap-2 flex flex-col items-start z-10">
            <div
              className={cn(
                'bg-[#313130] pl-4 pr-6 pb-1.5 rounded-br-[20px]',
                'border-b-2 border-r-2 border-black',
                bgShowsRarity && rarity?.bgClass,
              )}
            >
              {title}
            </div>
          </div>
          <div className="absolute top-6 inset-x-0 flex flex-col items-end gap-1 z-10">
            {item.tags?.map((itemTag) => (
              <ItemCardChip key={itemTag} className="relative z-10">
                {capitalCase(itemTag)}
                {bgShowsRarity && (
                  <div
                    className={cn(
                      'absolute inset-0 -z-10 border-r-2 border-black rounded-l-full',
                      getTagDefinition(itemTag).bgClass,
                    )}
                  />
                )}
              </ItemCardChip>
            ))}
            {rarity && !bgShowsRarity && (
              <ItemCardChip className={rarity.textClass}>
                {capitalCase(rarity.name)}
              </ItemCardChip>
            )}
            {item.unique && (
              <ItemCardChip className="text-emerald-500">Unique</ItemCardChip>
            )}
            {item.sellPrice === 0 && (
              <ItemCardChip className="text-red-500">Unsellable</ItemCardChip>
            )}
          </div>
          <div className="border-black border-2 rounded-lg overflow-hidden aspect-square">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={title}
                className="aspect-square h-full w-full object-cover"
              />
            ) : (
              <div
                className={cn(
                  'aspect-square h-full w-full bg-gradient-to-br from-slate-800 to-slate-950',
                  'flex items-center justify-center p-8 text-center text-2xl',
                )}
              >
                {title}
              </div>
            )}
          </div>
        </div>
        {count >= 2 && (
          <div className="absolute inset-0 flex flex-col items-center justify-start py-16">
            <div className="text-white rounded-full font-black px-8 py-2 text-6xl bg-black/80 -rotate-12 scale-150">
              {count}x
            </div>
          </div>
        )}
      </div>

      {!onlyTop && (
        <div
          className={cn(
            'relative flex flex-1 flex-col justify-center rounded-lg p-2 text-xs',
            bgShowsRarity
              ? [rarity?.bgClass, rarity?.bgClass && 'border-2 border-black']
              : [tag.bgClass, tag.bgClass && 'border-2 border-black'],
            theme.classBottom,
          )}
        >
          <div className="absolute -top-8 inset-x-2 flex flex-col items-start gap-2">
            {showPrice && item.price > 0 && (
              <StatsDisplay
                size="sm"
                stats={
                  priceAsWeight ? { weight: item.price } : { gold: item.price }
                }
                className={theme.classBottom}
                disableTooltip={tooltipsDisabled}
              />
            )}
          </div>
          <div className="flex flex-col items-center gap-2">
            {item.stats && (
              <StatsDisplay
                size="sm"
                relative
                stats={item.stats}
                disableTooltip={tooltipsDisabled}
                canWrap
              />
            )}
            {item.statsItem?.healthMax && <StatsBars stats={item.statsItem} />}
            {item.statsItem && (
              <div className="flex flex-row items-center gap-2">
                <div>Item:</div>
                <StatsDisplay
                  size="sm"
                  relative
                  stats={item.statsItem}
                  disableTooltip={tooltipsDisabled}
                  canWrap
                  hideBars
                />
              </div>
            )}
            {item.triggers?.map((trigger, index) => (
              <MatchReplayTriggerDisplay
                key={index}
                trigger={trigger}
                sideIdx={sideIdx}
                itemIdx={itemIdx}
                triggerIdx={index}
                disableTooltip={tooltipsDisabled}
                disableLinks={linksDisabled}
              />
            ))}
            {aspects.length > 0 && (
              <div className="flex flex-row flex-wrap items-center justify-center gap-2">
                {aspects.flatMap((aspect, aspectIdx) =>
                  aspect.triggers.map((trigger, triggerIdx) => (
                    <MatchReplayTriggerDisplay
                      key={`${aspectIdx}-${triggerIdx}`}
                      trigger={trigger}
                      sideIdx={sideIdx}
                      itemIdx={itemIdx}
                      triggerIdx={triggerIdx}
                      disableTooltip={tooltipsDisabled}
                      disableLinks={linksDisabled}
                      className={cn(
                        'relative z-10 min-w-min overflow-hidden rounded-xl p-1',
                        aspect.valuePercent === 1 && 'ring-2 ring-yellow-500',
                      )}
                    >
                      <div
                        className="absolute inset-y-0 left-0 -z-10 bg-black/50"
                        style={{ width: `${aspect.valuePercent * 100}%` }}
                      />
                    </MatchReplayTriggerDisplay>
                  )),
                )}
              </div>
            )}
            {item.shopEffects?.map((shopEffect, index) => (
              <MatchReplayShopEffectDisplay
                key={index}
                shopEffect={shopEffect}
                disableLinks={linksDisabled}
              />
            ))}
            {item.description && (
              <div className="flex flex-row items-center gap-2">
                <div className={fontLore.className}>{item.description}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export const MatchReplayCard = (props: MatchReplayCardProps) => {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const card = <MatchReplayCardFrame {...props} onlyTop />
  const side =
    props.sideIdx === undefined ? 'top' : props.sideIdx === 0 ? 'right' : 'left'
  const title = capitalCase(props.itemData.name)

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="flex touch-manipulation rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Show details for ${title}`}
            onClick={() => setDetailsOpen(true)}
          >
            {card}
          </button>
        </TooltipTrigger>
        <TooltipContent
          className="rounded-xl border-none bg-transparent p-0 motion-reduce:animate-none"
          side={side}
        >
          <MatchReplayCardFrame {...props} size="320" onlyTop={false} />
        </TooltipContent>
      </Tooltip>
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="flex w-fit max-w-[calc(100vw-2rem)] flex-col items-center border-0 bg-transparent p-0 shadow-none motion-reduce:animate-none motion-reduce:transition-none">
          <DialogTitle className="sr-only">{title} details</DialogTitle>
          <DialogDescription className="sr-only">
            Full combat card details for {title}.
          </DialogDescription>
          <MatchReplayCardFrame {...props} size="320" onlyTop={false} />
        </DialogContent>
      </Dialog>
    </>
  )
}
