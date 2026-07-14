'use client'

import { CatalogImageDto, ThemeDefinitionDto } from '@/contracts/catalog'
import { MatchReplayParticipantDto } from '@/contracts/replay'
import { ItemDefinition } from '@/game/ItemDefinition'
import { countifyItems } from '@/game/countifyItems'
import { orderItemsWithoutLookup } from '@/game/orderItems'
import { cn } from '@/lib/utils'
import { Fragment } from 'react'
import { MatchCardOverlay } from './MatchCardOverlay'
import { MatchCardTimer } from './MatchCardTimer'
import { MatchReplayCard } from './MatchReplayCard'

export const MatchReplayCards = ({
  participant,
  itemDefinitions,
  theme,
  images,
}: {
  participant: MatchReplayParticipantDto
  itemDefinitions: ItemDefinition[]
  theme: ThemeDefinitionDto
  images: CatalogImageDto[]
}) => {
  const countifiedItems = countifyItems(participant.loadout.items)
  const orderedItemsWithDefinitions = orderItemsWithoutLookup(
    countifiedItems.map((itemData) => {
      const definition: ItemDefinition = itemDefinitions.find(
        (item) => item.name === itemData.name,
      ) ?? {
        name: itemData.name,
        price: 0,
        shop: false,
        tags: ['deprecated'],
      }
      return { ...definition, definition, itemData }
    }),
  )

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 grid-flow-dense">
      {orderedItemsWithDefinitions.map(
        ({ definition: item, itemData }, itemIdx) => {
          const imageUrl = images.find(
            (image) =>
              image.itemId === itemData.name &&
              image.themeId === participant.themeId,
          )?.url
          const hasInterval = item.triggers?.some(
            (trigger) => trigger.type === 'interval',
          )

          return (
            <Fragment key={`${itemData.name}-${itemIdx}`}>
              <div className={cn('m-1 relative')}>
                <MatchReplayCard
                  itemData={itemData}
                  item={item}
                  theme={theme}
                  imageUrl={imageUrl}
                  size="80"
                  sideIdx={participant.sideIdx}
                  itemIdx={itemIdx}
                />
                {hasInterval && (
                  <MatchCardTimer
                    sideIdx={participant.sideIdx}
                    itemIdx={itemIdx}
                  />
                )}
                <MatchCardOverlay
                  sideIdx={participant.sideIdx}
                  itemIdx={itemIdx}
                  theme={theme}
                />
              </div>
            </Fragment>
          )
        },
      )}
    </div>
  )
}
