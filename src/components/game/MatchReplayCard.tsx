'use client'

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ThemeDefinitionDto } from '@/contracts/catalog'
import { ItemDefinition, Trigger } from '@/game/ItemDefinition'
import { getRarityDefinition } from '@/game/rarities'
import { Stats } from '@/game/stats'
import { getTagDefinition } from '@/game/tags'
import { cn } from '@/lib/utils'
import { capitalCase } from 'change-case'
import { first } from 'lodash-es'
import { ItemCardChip } from './ItemCardChip'
import { ItemData } from './ItemData'
import { StatsBars } from './StatsBars'
import { StatsDisplay } from './StatsDisplay'

export type MatchReplayCardProps = {
  itemData: ItemData
  item: ItemDefinition
  theme: ThemeDefinitionDto
  imageUrl?: string
  size?: '320' | '240' | '200' | '160' | '120' | '80'
  sideIdx?: number
}

const StatsRow = ({ label, stats }: { label?: string; stats?: Stats }) => {
  if (!stats) return null
  return (
    <div className="flex flex-row gap-2 items-center justify-center">
      {label && <div>{label}</div>}
      <StatsDisplay size="sm" relative stats={stats} canWrap />
    </div>
  )
}

const ReplayTrigger = ({ trigger }: { trigger: Trigger }) => {
  if (trigger.hidden) return null
  const title =
    trigger.type === 'interval'
      ? `Every ${trigger.cooldown / 1000}s`
      : trigger.type === 'startOfBattle'
        ? 'Start of battle'
        : capitalCase(trigger.type)

  return (
    <div className="p-2 bg-border/40 rounded-md flex flex-col gap-1 items-center min-w-40">
      <div className="font-bold">
        {title}
        {trigger.chancePercent
          ? ` (${Math.round(trigger.chancePercent)}%)`
          : ''}
      </div>
      {trigger.description && (
        <div className="text-center text-xs">{trigger.description}</div>
      )}
      <StatsRow label="Required:" stats={trigger.statsRequired} />
      <StatsRow label="Target needs:" stats={trigger.statsRequiredTarget} />
      <StatsRow stats={trigger.statsSelf} />
      <StatsRow label="Item:" stats={trigger.statsItem} />
      <StatsRow label="Target:" stats={trigger.statsTarget} />
      <StatsRow label="Enemy:" stats={trigger.statsEnemy} />
      <StatsRow stats={trigger.attack} />
      {trigger.modifiers?.map((modifier) => (
        <div key={modifier.description} className="text-xs text-center">
          {modifier.description}
        </div>
      ))}
      {trigger.maxCount && (
        <div className="text-xs">
          {trigger.maxCount === 1
            ? 'max once'
            : `max ${trigger.maxCount} times`}
        </div>
      )}
    </div>
  )
}

export const MatchReplayCardFrame = ({
  itemData,
  item,
  theme,
  imageUrl,
  size,
  onlyTop,
}: MatchReplayCardProps & { onlyTop: boolean }) => {
  const title = capitalCase(itemData.name)
  const tag = getTagDefinition(first(item.tags) ?? 'default')
  const count = itemData.count ?? 1
  const rarityKey = itemData.rarity ?? item.rarity
  const rarity = rarityKey ? getRarityDefinition(rarityKey) : undefined
  const bgShowsRarity = Boolean(itemData.rarity)

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
          'scale-[37.5%] -mx-[100px] -my-[156px]',
          onlyTop && '-my-[100px]',
        ],
        size === '200' && [
          'scale-[62.5%] -mx-[60px] -my-[94px]',
          onlyTop && '-my-[60px]',
        ],
        size === '240' && [
          'scale-[75%] -mx-[40px] -my-[63px]',
          onlyTop && '-my-[40px]',
        ],
        'select-none',
        bgShowsRarity && rarity?.bgClass,
      )}
    >
      <div
        className={cn(
          'aspect-square relative rounded-tr-lg rounded-b-lg overflow-hidden bg-black',
          'text-white font-bold [text-shadow:_1px_1px_4px_rgb(0_0_0_/_80%)]',
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
            'flex-1 flex flex-col rounded-lg p-2 text-xs relative overflow-y-auto',
            bgShowsRarity
              ? [rarity?.bgClass, rarity?.bgClass && 'border-2 border-black']
              : [tag.bgClass, tag.bgClass && 'border-2 border-black'],
            theme.classBottom,
          )}
        >
          <div className="flex flex-col items-center gap-2 my-auto">
            <StatsRow stats={item.stats} />
            {item.statsItem?.healthMax && <StatsBars stats={item.statsItem} />}
            <StatsRow label="Item:" stats={item.statsItem} />
            {item.triggers?.map((trigger, index) => (
              <ReplayTrigger key={index} trigger={trigger} />
            ))}
            {item.shopEffects?.map((effect, index) => (
              <div key={index} className="text-center">
                {capitalCase(effect.type)}{' '}
                {effect.tags
                  .map((effectTag) => capitalCase(effectTag))
                  .join(', ')}
              </div>
            ))}
            {item.description && (
              <div className="text-center">{item.description}</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export const MatchReplayCard = (props: MatchReplayCardProps) => {
  const card = <MatchReplayCardFrame {...props} onlyTop />
  const side = props.sideIdx === 0 ? 'right' : 'left'

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="flex rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Show details for ${capitalCase(props.itemData.name)}`}
        >
          {card}
        </button>
      </TooltipTrigger>
      <TooltipContent
        className="p-0 border-none bg-transparent rounded-xl"
        side={side}
      >
        <MatchReplayCardFrame {...props} size="320" onlyTop={false} />
      </TooltipContent>
    </Tooltip>
  )
}
