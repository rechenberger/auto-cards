'use client'

import { getItemByName } from '@/game/allItems'
import type { ItemData } from './ItemData'
import { TinyItemClient } from './TinyItemClient'

export const TinyItem = ({
  itemData,
  disableLinks,
}: {
  itemData: ItemData
  disableLinks?: boolean
}) => (
  <TinyItemClient
    itemDef={getItemByName(itemData.name)}
    itemData={itemData}
    disableLinks={disableLinks}
  />
)
