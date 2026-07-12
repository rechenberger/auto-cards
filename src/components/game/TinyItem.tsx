'use client'

import { getItemByName } from '@/game/allItems'
import type { ItemData } from './ItemData'
import { TinyItemClient } from './TinyItemClient'

export const TinyItem = ({ itemData }: { itemData: ItemData }) => (
  <TinyItemClient itemDef={getItemByName(itemData.name)} itemData={itemData} />
)
