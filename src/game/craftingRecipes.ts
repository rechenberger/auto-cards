import { ItemName } from './allItems'
import { GAME_VERSION } from './config'

type CraftingItem = {
  name: ItemName
  count?: number
}

export type CraftingRecipe = {
  id: number
  input: CraftingItem[]
  output: CraftingItem[]
  version?: number
}

export const craftingRecipes: CraftingRecipe[] = [
  {
    id: 1,
    input: [
      { name: 'shortBow', count: 1 },
      { name: 'roseBush', count: 1 },
    ],
    output: [{ name: 'thornBow' }],
  },
  {
    id: 2,
    input: [
      { name: 'shortBow', count: 1 },
      { name: 'luckyClover', count: 2 },
    ],
    output: [{ name: 'luckyBow' }],
  },
  {
    id: 3,
    input: [
      { name: 'shortBow', count: 1 },
      { name: 'flyAgaric', count: 1 },
    ],
    output: [{ name: 'poisonBow' }],
  },
  {
    id: 4,
    input: [
      { name: 'dagger', count: 1 },
      { name: 'chiliPepper', count: 1 },
    ],
    output: [{ name: 'fireDagger' }],
  },
  {
    id: 5,
    input: [{ name: 'beer', count: 2 }],
    output: [{ name: 'beer', count: 1 }, { name: 'beerFest' }],
  },
  {
    id: 6,
    input: [{ name: 'beerFest', count: 1 }],
    output: [{ name: 'beer', count: 1 }],
  },
  {
    id: 7,
    input: [{ name: 'roseBush', count: 2 }],
    output: [{ name: 'roseBush', count: 1 }, { name: 'thornsFest' }],
  },
  {
    id: 8,
    input: [{ name: 'thornsFest', count: 1 }],
    output: [{ name: 'roseBush', count: 1 }],
  },
  {
    id: 9,
    input: [{ name: 'icicle', count: 2 }],
    output: [{ name: 'icicle', count: 1 }, { name: 'frostFest' }],
  },
  {
    id: 10,
    input: [{ name: 'frostFest', count: 1 }],
    output: [{ name: 'icicle', count: 1 }],
  },
  {
    id: 11,
    input: [{ name: 'woodenBuckler', count: 2 }],
    output: [{ name: 'woodenBuckler', count: 1 }, { name: 'blockFest' }],
  },
  {
    id: 12,
    input: [{ name: 'blockFest', count: 1 }],
    output: [{ name: 'woodenBuckler', count: 1 }],
  },
  {
    id: 13,
    input: [
      { name: 'woodenSword', count: 1 },
      { name: 'metalGloves', count: 1 },
    ],
    output: [{ name: 'longSword' }],
    version: 2,
  },
  {
    id: 14,
    input: [
      { name: 'shortBow', count: 1 },
      { name: 'spear', count: 1 },
    ],
    output: [{ name: 'crossBow' }],
    version: 2,
  },
  {
    id: 15,
    input: [{ name: 'flyAgaric', count: 2 }],
    output: [{ name: 'foodPoison', count: 1 }],
    version: 2,
  },
  {
    id: 16,
    input: [
      { name: 'woodenBuckler', count: 1 },
      { name: 'unstableManaCrystal', count: 1 },
    ],
    output: [{ name: 'manaShield', count: 1 }],
    version: 2,
  },
  {
    id: 17,
    input: [
      { name: 'woodenSword', count: 1 },
      { name: 'unstableManaCrystal', count: 1 },
    ],
    output: [{ name: 'manaSword', count: 1 }],
    version: 2,
  },
  {
    id: 18,
    input: [
      { name: 'dagger', count: 1 },
      { name: 'unstableManaCrystal', count: 1 },
    ],
    output: [{ name: 'manaDagger', count: 1 }],
    version: 2,
  },
]

export const getCraftingRecipes = async () => {
  let recipes = craftingRecipes

  recipes = recipes.filter((recipe) => {
    return !recipe.version || recipe.version <= GAME_VERSION
  })

  return recipes
}
