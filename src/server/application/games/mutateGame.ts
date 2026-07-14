import { GameCommand, GameCommandResponse } from '@/contracts/game-api'
import { Game } from '@/db/schema-zod'
import { getItemByName, ItemName } from '@/game/allItems'
import type { ItemAspect } from '@/game/aspects'
import { calcStats, throwIfNegativeStats } from '@/game/calcStats'
import { countifyItems } from '@/game/countifyItems'
import { generateShopItems } from '@/game/generateShopItems'
import { getCraftingRecipesGame } from '@/game/getCraftingRecipesGame'
import { getSpecialBuyRound } from '@/game/getSpecialBuyRound'
import { getRoundStats } from '@/game/roundStats'
import { negativeItems, sumItems } from '@/game/sumItems'
import { invalidCommand } from '@/server/api/ApiError'
import { capitalCase } from 'change-case'
import { isEqual } from 'lodash-es'

type CommandResult = NonNullable<GameCommandResponse['result']>

const requireShopItem = ({ game, index }: { game: Game; index: number }) => {
  const shopItem = game.data.shopItems[index]
  if (!shopItem) throw invalidCommand('Shop item does not exist')
  return shopItem
}

const buy = async ({
  game,
  shopItemIndex,
}: {
  game: Game
  shopItemIndex: number
}): Promise<CommandResult> => {
  const shopItem = requireShopItem({ game, index: shopItemIndex })
  if (shopItem.isSold) throw invalidCommand('Item is already sold')

  const item = getItemByName(shopItem.name, game.version)
  const price = shopItem.isOnSale ? Math.ceil(item.price * 0.5) : item.price
  if (game.data.gold < price) throw invalidCommand('Not enough gold')

  const itemInLoadout = game.data.currentLoadout.items.find(
    (candidate) => candidate.name === shopItem.name,
  )
  if (item.unique && itemInLoadout) {
    throw invalidCommand('You can only have a unique item once')
  }

  game.data.gold -= price
  shopItem.isSold = true
  shopItem.isReserved = false
  game.data.currentLoadout.items = countifyItems([
    ...game.data.currentLoadout.items,
    { name: shopItem.name, aspects: shopItem.aspects },
  ])

  const stats = calcStats({
    loadout: game.data.currentLoadout,
    gameVersion: game.version,
  })
  throwIfNegativeStats({ stats })

  if (shopItem.isSpecial) {
    game.data.shopRerolls += 1
    game.data.shopItems = await generateShopItems({ game })
  }

  return {
    type: 'item-bought',
    message: `Bought ${capitalCase(shopItem.name)} for ${price} gold`,
  }
}

const reroll = async (game: Game): Promise<CommandResult> => {
  if (getSpecialBuyRound({ game })) {
    throw invalidCommand('This shop cannot be rerolled')
  }
  const price = 1
  if (game.data.gold < price) throw invalidCommand('Not enough gold')
  game.data.gold -= price
  game.data.shopRerolls += 1
  game.data.shopItems = await generateShopItems({ game })
  return { type: 'shop-rerolled' }
}

const sell = async ({
  game,
  itemName,
  aspects,
}: {
  game: Game
  itemName: ItemName
  aspects?: ItemAspect[]
}): Promise<CommandResult> => {
  const item = getItemByName(itemName, game.version)
  const sellPrice = item.sellPrice ?? Math.ceil(item.price / 2)
  if (sellPrice <= 0) throw invalidCommand('This item cannot be sold')

  const loadoutItemIndex = game.data.currentLoadout.items.findIndex(
    (candidate) =>
      candidate.name === itemName && isEqual(candidate.aspects, aspects),
  )
  if (loadoutItemIndex === -1) {
    throw invalidCommand('This item is not in the loadout')
  }

  const loadoutItem = game.data.currentLoadout.items[loadoutItemIndex]
  const count = loadoutItem.count ?? 1
  if (count > 1) {
    loadoutItem.count = count - 1
  } else {
    game.data.currentLoadout.items.splice(loadoutItemIndex, 1)
  }
  game.data.gold += sellPrice
  return {
    type: 'item-sold',
    message: `Sold ${capitalCase(itemName)} for ${sellPrice} gold`,
  }
}

const craft = async ({
  game,
  recipeIndex,
}: {
  game: Game
  recipeIndex: number
}): Promise<CommandResult> => {
  const recipes = getCraftingRecipesGame({ game })
  const recipe = recipes[recipeIndex]
  if (!recipe) throw invalidCommand('Crafting recipe does not exist')
  if (!recipe.hasAll || recipe.uniqueAlreadyCrafted) {
    throw invalidCommand('Crafting requirements are not met')
  }

  game.data.currentLoadout.items = sumItems(
    game.data.currentLoadout.items,
    negativeItems(recipe.input),
    recipe.output,
  )
  return { type: 'item-crafted' }
}

const nextRound = async (game: Game): Promise<CommandResult> => {
  const roundStats = getRoundStats(game.version)
  game.data.roundNo += 1
  game.data.shopRerolls = 0
  game.data.gold += roundStats[game.data.roundNo]?.gold ?? 0

  for (const loadoutItem of game.data.currentLoadout.items) {
    const item = getItemByName(loadoutItem.name, game.version)
    for (const trigger of item.triggers ?? []) {
      if (trigger.type === 'onShopEntered' && trigger.statsSelf?.gold) {
        game.data.gold += trigger.statsSelf.gold * (loadoutItem.count ?? 1)
      }
    }
  }

  const experience = roundStats[game.data.roundNo]?.experience ?? 0
  const experienceItem = game.data.currentLoadout.items.find(
    (item) => item.name === ('experience' satisfies ItemName),
  )
  if (experienceItem) {
    experienceItem.count = (experienceItem.count ?? 0) + experience
  } else {
    game.data.currentLoadout.items.push({
      name: 'experience' satisfies ItemName,
      count: experience,
    })
  }

  game.data.shopItems = await generateShopItems({ game })
  return { type: 'round-started' }
}

export const mutateGame = async ({
  game,
  command,
  isAdmin,
}: {
  game: Game
  command: Exclude<GameCommand, { type: 'fight' }>
  isAdmin: boolean
}): Promise<CommandResult> => {
  switch (command.type) {
    case 'buy':
      return buy({ game, shopItemIndex: command.shopItemIndex })
    case 'toggle-reserve': {
      const item = requireShopItem({ game, index: command.shopItemIndex })
      if (item.isSpecial)
        throw invalidCommand('Special items cannot be reserved')
      if (item.isSold) throw invalidCommand('Sold items cannot be reserved')
      item.isReserved = !item.isReserved
      return { type: item.isReserved ? 'item-reserved' : 'item-unreserved' }
    }
    case 'reroll':
      return reroll(game)
    case 'sell':
      return sell({
        game,
        itemName: command.itemName,
        aspects: command.aspects,
      })
    case 'craft':
      return craft({ game, recipeIndex: command.recipeIndex })
    case 'next-round':
      return nextRound(game)
    case 'admin-add-gold':
      if (!isAdmin) throw invalidCommand('Admin access required')
      game.data.gold += command.amount
      return { type: 'gold-added' }
  }
}
