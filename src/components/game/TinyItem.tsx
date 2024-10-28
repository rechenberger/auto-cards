import { streamItemCard } from '@/components/game/streamItemCard'
import { getItemByName } from '@/game/allItems'
import { ItemData } from './ItemData'
import { TinyItemClient } from './TinyItemClient'

export const TinyItem = async ({ itemData }: { itemData: ItemData }) => {
  const itemDef = await getItemByName(itemData.name)
  const action = async () => {
    'use server'
    return streamItemCard({ itemData })
  }
  return (
    <>
      <TinyItemClient itemDef={itemDef} itemData={itemData} action={action} />
    </>
  )
}
