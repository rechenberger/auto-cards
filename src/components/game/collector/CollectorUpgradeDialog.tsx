import { SimpleTooltipButton } from '@/components/simple/SimpleTooltipButton'
import { getAspectDef } from '@/game/aspects'
import { gameAction } from '@/game/gameAction'
import { allRarities, allRarityDefinitions } from '@/game/rarities'
import { createSeed, rngItem } from '@/game/seed'
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
  gameId: string
}

export const CollectorUpgradeDialog = async (
  props: CollectorUpgradeDialogProps,
) => {
  const { item, gameId } = props
  const rarity = item.rarity
  if (!rarity) {
    throw new Error('Item has no rarity')
  }
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
        <ActionButton
          action={async () => {
            'use server'
            return gameAction({
              gameId,
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
          Upgrade
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
