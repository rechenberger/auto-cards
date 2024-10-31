import { gameAction } from '@/game/gameAction'
import { allRarities, allRarityDefinitions } from '@/game/rarities'
import { streamDialog } from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { capitalCase } from 'change-case'
import { ArrowDown } from 'lucide-react'
import { ItemCard } from '../ItemCard'
import { ItemData } from '../ItemData'

type CollectorUpgradeDialogProps = {
  item: ItemData
  gameId: string
}

export const CollectorUpgradeDialog = (props: CollectorUpgradeDialogProps) => {
  const { item, gameId } = props
  const rarity = item.rarity
  if (!rarity) {
    throw new Error('Item has no rarity')
  }
  const nextRarity = allRarityDefinitions[allRarities.indexOf(rarity) + 1]
  if (!nextRarity) {
    throw new Error('Item has max rarity')
  }
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
            <div>+1 random aspect</div>
          </div>
        </div>
        <ActionButton
          action={async () => {
            'use server'
            return gameAction({
              gameId,
              action: async ({ ctx }) => {
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
