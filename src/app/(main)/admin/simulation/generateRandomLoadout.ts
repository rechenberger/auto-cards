import { getAllItems } from '@/game/allItems'
import { countifyItems } from '@/game/countifyItems'
import { orderItems } from '@/game/orderItems'
import { rngItem, SeedRng } from '@/game/seed'

export const generateRandomLoadout = async ({
  gold,
  seed,
}: {
  gold: number
  seed: SeedRng
}) => {
  let items: { name: string; count: number }[] = []

  while (gold > 0) {
    let buyables = await getAllItems()
    buyables = buyables.filter((item) => {
      if (!item.price) return false
      if (item.price > gold) return false
      if (item.unique) {
        const alreadyInHand = items.some((i) => i.name === item.name)
        if (alreadyInHand) return false
      }

      // TODO: check negative stats?
      return true
    })
    const item = rngItem({
      seed,
      items: buyables,
    })
    if (!item) {
      break
    }

    gold -= item.price
    items.push({ name: item.name, count: 1 })
  }

  items = await orderItems(countifyItems(items))

  return {
    loadout: {
      items,
    },
    goldRemaining: gold,
  }
}
