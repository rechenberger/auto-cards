import { Game } from '@/db/schema-zod'
import { every, filter, map, orderBy, some } from 'lodash-es'
import { getAllItems } from './allItems'
import { countifyItems } from './countifyItems'
import { getCraftingRecipes } from './craftingRecipes'

export const getCraftingRecipesGame = async ({ game }: { game?: Game }) => {
  const all = await getCraftingRecipes()
  const allItems = await getAllItems()
  const myItems = countifyItems(game?.data.currentLoadout.items ?? [])

  let results = map(all, (recipe) => {
    const input = map(recipe.input, (item) => {
      const myItem = myItems.find((i) => i.name === item.name)
      const countCurrent = myItem?.count ?? 0
      const countRequired = item.count ?? 1
      const hasEnough = countCurrent >= countRequired
      return {
        ...item,
        hasEnough,
        countCurrent,
      }
    })

    const hasAll = every(input, (i) => i.hasEnough)
    const hasSome = some(input, (i) => i.countCurrent > 0)

    const output = map(recipe.output, (item) => {
      const def = allItems.find((i) => i.name === item.name)
      if (!def) {
        throw new Error(`Item ${item.name} not found`)
      }
      const myItem = myItems.find((i) => i.name === item.name)
      const countCurrent = myItem?.count ?? 0
      let uniqueAlreadyCrafted = def.unique && countCurrent > 0
      return {
        ...item,
        uniqueAlreadyCrafted,
      }
    })

    const uniqueAlreadyCrafted = some(output, (i) => i.uniqueAlreadyCrafted)

    return {
      ...recipe,
      input,
      output,
      hasAll,
      hasSome,
      uniqueAlreadyCrafted,
    }
  })

  if (game) {
    results = filter(results, (r) => r.hasSome)
    results = filter(results, (r) => !r.uniqueAlreadyCrafted)
    results = orderBy(results, (r) => r.hasAll, 'desc')
  }

  return results
}
