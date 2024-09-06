import { Game } from '@/db/schema-zod'
import { every, filter, map, orderBy, some } from 'lodash-es'
import { countifyItems } from './countifyItems'
import { getCraftingRecipes } from './craftingRecipes'

export const getCraftingRecipesGame = async ({ game }: { game?: Game }) => {
  const all = await getCraftingRecipes()
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

    return {
      ...recipe,
      input,
      hasAll,
      hasSome,
    }
  })

  if (game) {
    results = filter(results, (r) => r.hasSome)
    results = orderBy(results, (r) => r.hasAll, 'desc')
  }

  return results
}
