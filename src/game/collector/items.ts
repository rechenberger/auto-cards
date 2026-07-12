import { Game } from '@/db/schema-zod'
import { getItemByName } from '@/game/allItems'
import { allAspects, ItemAspect } from '@/game/aspects'
import { ItemData } from '@/game/ItemData'
import { randomRarityByWeight } from '@/game/randomRarityByWeight'
import {
  allRarities,
  getRarityDefinition,
  Rarity,
  RarityWeights,
} from '@/game/rarities'
import { COLLECTOR_ASPECT_PRECISION } from '@/game/rules'
import { rngFloat, rngGenerator, rngItem, rngItems, Seed } from '@/game/seed'
import { generateShopItemsRaw } from '@/game/generateShopItemsRaw'
import { createId } from '@paralleldrive/cuid2'
import { floor } from 'lodash-es'
import { checkCollectorLoadout } from './checkCollectorLoadout'

export const getPossibleCollectorAspects = (
  item: ItemData,
  rulesetVersion: number,
) => {
  const itemDef = getItemByName(item.name, rulesetVersion)
  return allAspects.filter(
    (aspect) => aspect.tags?.some((tag) => itemDef.tags?.includes(tag)),
  )
}

export const generateCollectorItemAspects = ({
  item,
  seed: inputSeed,
  rarity,
  multiplier,
  rulesetVersion,
}: {
  item: ItemData
  seed: Seed
  rarity: Rarity
  multiplier?: number
  rulesetVersion: number
}) => {
  const seed = rngGenerator({ seed: inputSeed })
  const itemDef = getItemByName(item.name, rulesetVersion)
  const numberOfAspects = getRarityDefinition(rarity).aspects.normal
  const possibleAspects = getPossibleCollectorAspects(item, rulesetVersion)

  if (possibleAspects.length < numberOfAspects) {
    console.warn(
      `Not enough possible aspects for ${itemDef.name} (${itemDef.tags?.join(
        ', ',
      )})`,
    )
  }

  const aspectDefs = rngItems({
    seed,
    items: possibleAspects,
    count: numberOfAspects,
  })
  const aspects: ItemAspect[] = aspectDefs.map((aspectDef) => ({
    name: aspectDef.name,
    rnd: floor(rngFloat({ seed }), COLLECTOR_ASPECT_PRECISION),
    multiplier,
  }))

  return { ...item, aspects, rarity } satisfies ItemData
}

export const generateCollectorItem = async ({
  game,
  seed: inputSeed,
  rarity,
}: {
  game: Game
  seed: Seed
  rarity: Rarity
}) => {
  const seed = rngGenerator({ seed: inputSeed })
  let items = await generateShopItemsRaw({
    game,
    skipRarityWeights: true,
    skipSpecialBuyRound: true,
    skipUniqueCheck: true,
  })
  items = items.filter((item) => !item.isSpecial && !item.locked)
  const rarityIndex = allRarities.indexOf(rarity)
  items = items.filter(
    (item) =>
      item.item.rarity && allRarities.indexOf(item.item.rarity) <= rarityIndex,
  )
  const item = rngItem({ seed, items })
  if (!item) throw new Error('No collector item found')

  return generateCollectorItemAspects({
    item: item.item,
    seed,
    rarity,
    rulesetVersion: game.version,
  })
}

export const generateCollectorItemByRarityWeight = async ({
  game,
  seed: inputSeed,
  rarityWeights,
}: {
  game: Game
  seed: Seed
  rarityWeights: RarityWeights
}) => {
  const seed = rngGenerator({ seed: inputSeed })
  const rarity = randomRarityByWeight({ rarityWeights, seed })
  return generateCollectorItem({ game, seed, rarity })
}

export const addCollectorItem = ({
  game,
  item,
  now = new Date().toISOString(),
}: {
  game: Game
  item: ItemData
  now?: string
}) => {
  const itemWithId = { ...item, id: createId(), createdAt: now }
  game.data.inventory ??= { items: [] }
  game.data.inventory.items.push(itemWithId)

  const loadoutWithItem = {
    ...game.data.currentLoadout,
    items: [...game.data.currentLoadout.items, itemWithId],
  }
  if (
    checkCollectorLoadout({
      loadout: loadoutWithItem,
      rulesetVersion: game.version,
    }).allGood
  ) {
    game.data.currentLoadout = loadoutWithItem
  }
  return itemWithId
}
