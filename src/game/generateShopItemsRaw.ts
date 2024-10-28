import { Game } from '@/db/schema-zod'
import { range } from 'lodash-es'
import { getAllItems } from './allItems'
import { NO_OF_SHOP_ITEMS, SHOP_EFFECT_BOOST_MULTIPLIER } from './config'
import { getSpecialBuyRound } from './getSpecialBuyRound'
import { roundStats } from './roundStats'
import { getTagDefinition } from './tags'

export const generateShopItemsRaw = async ({
  game,
  skipRarityWeights,
  skipSpecialBuyRound,
  skipUniqueCheck,
}: {
  game: Game
  skipRarityWeights?: boolean
  skipSpecialBuyRound?: boolean
  skipUniqueCheck?: boolean
}) => {
  const roundStat = roundStats[game.data.roundNo]

  const specialBuyRound = skipSpecialBuyRound
    ? undefined
    : getSpecialBuyRound({ game })

  const allItems = await getAllItems()
  let itemsForSale = allItems.filter((item) => !!item.shop)

  // Check for unique items
  if (!skipUniqueCheck) {
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
  }

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

  const itemsWeighted = itemsForSale.map((item) => {
    let weight = 1
    let locked = false
    let isSpecial = false

    for (const tag of item.tags ?? []) {
      const tagDef = getTagDefinition(tag)
      if (tagDef.locked) {
        locked = true
      }
      if (tagDef.isSpecial) {
        isSpecial = true
      }
    }

    if (!skipRarityWeights && roundStat.rarityWeights) {
      if (item.rarity) {
        const rarityWeight = roundStat.rarityWeights[item.rarity]
        weight *= rarityWeight ?? 0
      }

      // Lower weight for items of a rarity group by it's size to keep the overall rarity weights (i.e. 1% rare items in first round)
      const rarityItems = itemsForSale.filter((i) => i.rarity === item.rarity)
      weight /= rarityItems.length
    }

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
      locked,
      isSpecial,
    }
  })

  return itemsWeighted
}
