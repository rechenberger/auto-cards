import { SimpleTooltipButton } from '@/components/simple/SimpleTooltipButton'
import { Card } from '@/components/ui/card'
import { Game } from '@/db/schema-zod'
import { getAspectDef } from '@/game/aspects'
import { COLLECTOR_UPGRADE_COSTS } from '@/game/config'
import { gameAction } from '@/game/gameAction'
import {
  allRarities,
  allRarityDefinitions,
  getRarityDefinition,
} from '@/game/rarities'
import { createSeed, rngItem } from '@/game/seed'
import { cn } from '@/lib/utils'
import {
  streamDialog,
  streamToast,
} from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { capitalCase } from 'change-case'
import { ArrowDown, Info } from 'lucide-react'
import { ItemCard } from '../ItemCard'
import { ItemData } from '../ItemData'
import { getPossibleAspects } from './generateCollectorItemAspects'

type CollectorUpgradeDialogProps = {
  item: ItemData
  game: Game
}

export const CollectorUpgradeDialog = async (
  props: CollectorUpgradeDialogProps,
) => {
  const { item, game } = props
  const rarity = item.rarity
  if (!rarity) {
    throw new Error('Item has no rarity')
  }
  const rarityDef = getRarityDefinition(rarity)
  const nextRarity = allRarityDefinitions[allRarities.indexOf(rarity) + 1]
  if (!nextRarity) {
    return (
      <>
        <div className="flex flex-col gap-4 items-center">
          <div>Fully upgraded!</div>
          <ItemCard itemData={item} size="200" />
        </div>
      </>
    )
  }
  let possibleAspects = await getPossibleAspects(item)
  possibleAspects = possibleAspects.filter(
    (aspect) => !item.aspects?.some((a) => a.name === aspect.name),
  )
  const possibleAspectNames = possibleAspects.map((a) => a.name)

  const partsCosts = COLLECTOR_UPGRADE_COSTS
  const partsCurrent = game.data.salvagedParts?.[rarity] ?? 0
  const partsEnough = partsCurrent >= partsCosts

  return (
    <>
      <div className="flex flex-col gap-4 items-center">
        <div className="flex flex-col lg:flex-row gap-8">
          <ItemCard itemData={item} size="200" />
          <ArrowDown className="size-8 lg:-rotate-90 self-center" />
          <div className="flex flex-col gap-2 items-center">
            <ItemCard
              itemData={{ ...item, rarity: nextRarity.name }}
              size="200"
            />
            <SimpleTooltipButton
              tooltip={
                <>
                  <div className="flex flex-col gap-1">
                    <div>Possible aspects:</div>
                    {possibleAspects.map((aspect) => (
                      <div key={aspect.name} className="text-sm opacity-80">
                        {capitalCase(aspect.name)}
                      </div>
                    ))}
                  </div>
                </>
              }
              variant="vanilla"
              size="vanilla"
              icon={<Info />}
              tabIndex={-1}
            >
              <div>
                {possibleAspects.length > 1
                  ? `+1 of ${possibleAspects.length} random aspects`
                  : `+1 random aspect`}
              </div>
            </SimpleTooltipButton>
          </div>
        </div>
        <Card className="px-2 py-1 text-sm">
          <div
            className={cn(
              'flex flex-row gap-1 items-center',
              rarityDef.textClass,
            )}
          >
            <div className="flex-1 truncate">{capitalCase(rarity)} Parts</div>
            <div className="text-right">
              {partsCosts} / {partsCurrent}
            </div>
          </div>
        </Card>
        <ActionButton
          disabled={!partsEnough}
          catchToast
          action={async () => {
            'use server'
            return gameAction({
              gameId: game.id,
              action: async ({ ctx }) => {
                const seed = createSeed()
                const aspectName = rngItem({
                  seed,
                  items: possibleAspectNames,
                })
                if (!aspectName) {
                  throw new Error('No aspect found')
                }
                const aspect = getAspectDef(aspectName)
                streamToast({
                  title: `Upgraded ${capitalCase(item.name)}`,
                  description: `${capitalCase(aspect.name)} added`,
                })
                streamCollectorUpgradeDialog(props)
              },
            })
          }}
        >
          {partsEnough ? 'Upgrade' : 'Not enough parts'}
        </ActionButton>
      </div>
    </>
  )
}

export const streamCollectorUpgradeDialog = (
  props: CollectorUpgradeDialogProps,
) => {
  return streamDialog({
    title: `Upgrade ${capitalCase(props.item.name)}`,
    content: <CollectorUpgradeDialog {...props} />,
  })
}
