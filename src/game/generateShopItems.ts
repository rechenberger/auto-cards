import { Game, GameData } from '@/db/schema-zod'
import { range } from 'lodash-es'
import { getAllItems } from './allItems'
import {
  NO_OF_SHOP_ITEMS,
  SALE_CHANCE,
  SHOP_EFFECT_BOOST_MULTIPLIER,
} from './config'
import { getSpecialBuyRound } from './getSpecialBuyRound'
import { roundStats } from './roundStats'
import { rngFloat, rngItemsWithWeights } from './seed'
import { getTagDefinition } from './tags'

export const generateShopItems = async ({
  game,
  skipRarityWeights,
}: {
  game: Game
  skipRarityWeights?: boolean
}) => {
  const roundStat = roundStats[game.data.roundNo]

  const specialBuyRound = getSpecialBuyRound({ game })

  const allItems = await getAllItems()
  let itemsForSale = allItems.filter((item) => !!item.shop)

  // Check for unique items
  itemsForSale = itemsForSale.filter((item) => {
    if (!item.unique) return true
    const alreadyInHand = game.data.currentLoadout.items.some(
      (i) => i.name === item.name,
    )
    if (alreadyInHand) return false
    const alreadyInShop = game.data.shopItems.some(
      (i) => i.name === item.name && i.isReserved,
    )
    if (alreadyInShop) return false
    return true
  })

  const shopSeed = [
    game.data.seed,
    game.data.roundNo,
    game.data.shopRerolls,
    'shop',
  ]

  const shopEffects = game.data.currentLoadout.items.flatMap((item) => {
    const def = allItems.find((i) => i.name === item.name)
    if (!def) return []
    return range(item.count ?? 1).flatMap(() => def.shopEffects ?? [])
  })

  const oldItems = game.data.shopItems.filter((item) => item.isReserved)
  const itemsToGenerate = specialBuyRound
    ? specialBuyRound.noOfItems
    : NO_OF_SHOP_ITEMS - oldItems.length

  const itemsWeighted = itemsForSale
    .map((item) => {
      let weight = 1
      let locked = false
      let isSpecial = false

      if (!skipRarityWeights && roundStat.rarityWeights) {
        for (const tag of item.tags ?? []) {
          const tagDef = getTagDefinition(tag)
          if (tagDef.locked) {
            locked = true
          }
          if (tagDef.isSpecial) {
            isSpecial = true
          }
        }

        if (!item.rarity) {
          throw new Error(`Item ${item.name} has no rarity`)
        }
        const rarityWeight = roundStat.rarityWeights[item.rarity]
        weight *= rarityWeight ?? 0

        for (const shopEffect of shopEffects) {
          if (shopEffect.tags.some((t) => item.tags?.includes(t))) {
            if (shopEffect.type === 'boost') {
              weight *= SHOP_EFFECT_BOOST_MULTIPLIER
            } else if (shopEffect.type === 'ban') {
              weight = 0
            } else if (shopEffect.type === 'unlock') {
              locked = false
            } else {
              const _exhaustiveCheck: never = shopEffect.type
            }
          }
        }

        // const rarityItems = itemsForSale.filter((i) => i.rarity === item.rarity)
        // weight /= rarityItems.length

        // if (item.tags?.includes('weapon')) {
        //   weight *= 2
        // }
      }

      if (locked) {
        weight = 0
      }

      if (isSpecial !== !!specialBuyRound) {
        weight = 0
      }

      if (specialBuyRound) {
        const hasSpecialTag = item.tags?.includes(specialBuyRound.tag)
        if (!hasSpecialTag) {
          weight = 0
        }
      }

      return {
        item,
        weight,
      }
    })
    .filter((i) => i.weight > 0)

  const newItems = rngItemsWithWeights({
    seed: shopSeed,
    items: itemsWeighted,
    count: itemsToGenerate,
  })

  const shopItems: GameData['shopItems'] = newItems.map((newItem, idx) => {
    const itemSeed = [...shopSeed, idx]

    const isOnSale =
      rngFloat({
        seed: [...itemSeed, 'isOnSale'],
      }) < SALE_CHANCE

    return {
      name: newItem.name,
      isOnSale,
      isSpecial: !!specialBuyRound,
    }
  })
  shopItems.push(...oldItems)

  return shopItems
}
