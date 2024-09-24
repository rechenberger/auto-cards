import { ItemName } from './allItems'

type CraftingItem = {
  name: ItemName
  count?: number
}

export type CraftingRecipe = {
  input: CraftingItem[]
  output: CraftingItem[]
}

export const craftingRecipes: CraftingRecipe[] = [
  {
    input: [{ name: 'beer', count: 3 }],
    output: [{ name: 'beerFest' }],
  },
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
      { name: 'woodenSword', count: 1 },
      { name: 'metalGloves', count: 2 },
    ],
    output: [{ name: 'longSword' }],
  },
  {
    input: [
      { name: 'shortBow', count: 1 },
      { name: 'spear', count: 1 },
    ],
    output: [{ name: 'crossBow' }],
  },
]

export const getCraftingRecipes = async () => {
  return craftingRecipes
}
