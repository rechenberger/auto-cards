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
]

export const getCraftingRecipes = async () => {
  return craftingRecipes
}
