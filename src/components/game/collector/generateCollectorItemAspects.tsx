import { getItemByName } from '@/game/allItems'
import { allAspects } from '@/game/aspects'
import { getRarityDefinition, Rarity } from '@/game/rarities'
import { rngFloat, rngGenerator, rngItems, Seed } from '@/game/seed'
import { floor } from 'lodash-es'
import { ItemData } from '../ItemData'

export const generateCollectorItemAspects = async ({
  item,
  seed: _seed,
  rarity,
}: {
  item: ItemData
  seed: Seed
  rarity: Rarity
}) => {
  const seed = rngGenerator({ seed: _seed })
  const itemDef = await getItemByName(item.name)
  const rarityDef = getRarityDefinition(rarity)
  const noOfAspects = rarityDef.aspects.normal

  const possibleAspects = allAspects.filter(
    (a) => a.tags?.some((t) => itemDef.tags?.includes(t)),
  )

  if (possibleAspects.length < noOfAspects) {
    console.warn(
      `Not enough possible aspects for ${itemDef.name} (${itemDef.tags?.join(
        ', ',
      )})`,
    )
  }

  const aspectDefs = rngItems({
    seed,
    items: possibleAspects,
    count: noOfAspects,
  })
  const aspects = aspectDefs.map((aspectDef, idx) => ({
    name: aspectDef.name,
    rnd: floor(
      rngFloat({
        seed,
      }),
      3,
    ),
  }))

  const itemData: ItemData = {
    ...item,
    aspects,
    rarity,
  }

  return itemData
}
