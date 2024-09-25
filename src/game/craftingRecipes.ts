import { getAllItems, ItemName } from './allItems'

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
  // Filter disabled items:
  const allItems = await getAllItems()
  const recipes = craftingRecipes.filter((recipe) => {
    const allInputsExist = recipe.input.every((item) => {
      return !!allItems.find((i) => i.name === item.name)
    })
    const allOutputsExist = recipe.output.every((item) => {
      return !!allItems.find((i) => i.name === item.name)
    })
    return allInputsExist && allOutputsExist
  })

  return recipes
}
