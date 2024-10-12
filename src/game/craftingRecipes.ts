import { ItemName } from './allItems'
import { GAME_VERSION } from './config'

type CraftingItem = {
  name: ItemName
  count?: number
}

export type CraftingRecipe = {
  input: CraftingItem[]
  output: CraftingItem[]
  version?: number
}

export const craftingRecipes: CraftingRecipe[] = [
  {
    input: [
      { name: 'shortBow', count: 1 },
      { name: 'roseBush', count: 1 },
    ],
    output: [{ name: 'thornBow' }],
  },
  {
    input: [
      { name: 'shortBow', count: 1 },
      { name: 'luckyClover', count: 2 },
    ],
    output: [{ name: 'luckyBow' }],
  },
  {
    input: [
      { name: 'shortBow', count: 1 },
      { name: 'flyAgaric', count: 1 },
    ],
    output: [{ name: 'poisonBow' }],
  },
  {
    input: [
      { name: 'dagger', count: 1 },
      { name: 'chiliPepper', count: 1 },
    ],
    output: [{ name: 'fireDagger' }],
  },
  {
    input: [
      { name: 'dagger', count: 1 },
      { name: 'flyAgaric', count: 1 },
    ],
    output: [{ name: 'poisonDagger' }],
  },
  {
    input: [{ name: 'beer', count: 2 }],
    output: [{ name: 'beer', count: 1 }, { name: 'beerFest' }],
  },
  {
    input: [{ name: 'beerFest', count: 1 }],
    output: [{ name: 'beer', count: 1 }],
  },
  {
    input: [{ name: 'roseBush', count: 2 }],
    output: [{ name: 'roseBush', count: 1 }, { name: 'thornsFest' }],
  },
  {
    input: [{ name: 'thornsFest', count: 1 }],
    output: [{ name: 'roseBush', count: 1 }],
  },
  {
    input: [{ name: 'icicle', count: 2 }],
    output: [{ name: 'icicle', count: 1 }, { name: 'frostFest' }],
  },
  {
    input: [{ name: 'frostFest', count: 1 }],
    output: [{ name: 'icicle', count: 1 }],
  },
  {
    input: [{ name: 'woodenBuckler', count: 2 }],
    output: [{ name: 'woodenBuckler', count: 1 }, { name: 'blockFest' }],
  },
  {
    input: [{ name: 'blockFest', count: 1 }],
    output: [{ name: 'woodenBuckler', count: 1 }],
  },
  {
    input: [
      { name: 'woodenSword', count: 1 },
      { name: 'forgingHammer', count: 1 },
    ],
    output: [
      { name: 'broadSword', count: 1 },
      { name: 'forgingHammer', count: 1 },
    ],
    version: 2,
  },
  {
    input: [
      { name: 'broadSword', count: 1 },
      { name: 'metalGloves', count: 1 },
    ],
    output: [{ name: 'longSword', count: 1 }],
    version: 2,
  },
  {
    input: [
      { name: 'shortBow', count: 1 },
      { name: 'spear', count: 1 },
    ],
    output: [{ name: 'crossBow' }],
    version: 2,
  },
  {
    input: [{ name: 'flyAgaric', count: 2 }],
    output: [{ name: 'foodPoison', count: 1 }],
    version: 2,
  },
  {
    input: [
      { name: 'woodenBuckler', count: 1 },
      { name: 'unstableManaCrystal', count: 1 },
    ],
    output: [{ name: 'manaShield', count: 1 }],
    version: 2,
  },
  {
    input: [
      { name: 'woodenSword', count: 1 },
      { name: 'unstableManaCrystal', count: 1 },
    ],
    output: [{ name: 'manaSword', count: 1 }],
    version: 2,
  },
  {
    input: [
      { name: 'dagger', count: 1 },
      { name: 'unstableManaCrystal', count: 1 },
    ],
    output: [{ name: 'manaDagger', count: 1 }],
    version: 2,
  },
  {
    input: [
      { name: 'woodenBuckler', count: 1 },
      { name: 'forgingHammer', count: 1 },
    ],
    output: [{ name: 'knightShield', count: 1 }],
    version: 3,
  },
  {
    input: [{ name: 'knightShield', count: 2 }],
    output: [{ name: 'towerShield', count: 1 }],
    version: 3,
  },
]

export const getCraftingRecipes = async () => {
  let recipes = craftingRecipes

  recipes = recipes.filter((recipe) => {
    return !recipe.version || recipe.version <= GAME_VERSION
  })

  return recipes
}
