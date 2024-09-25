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
    input: [{ name: 'beer', count: 2 }],
    output: [{ name: 'beer', count: 1 }, { name: 'beerFest' }],
  },
  {
    input: [{ name: 'beerFest', count: 1 }],
    output: [{ name: 'beer', count: 1 }],
  },
  {
    input: [
      { name: 'woodenSword', count: 1 },
      { name: 'metalGloves', count: 2 },
    ],
    output: [{ name: 'longSword' }],
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
]

export const getCraftingRecipes = async () => {
  let recipes = craftingRecipes

  recipes = recipes.filter((recipe) => {
    return !recipe.version || recipe.version <= GAME_VERSION
  })

  return recipes
}
