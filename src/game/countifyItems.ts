import { ItemAspect } from './aspects'

export const countifyItems = <
  T extends {
    name: string
    count?: number
    aspects?: ItemAspect[]
  },
>(
  items: T[],
) => {
  const itemsWithAspects: T[] = []
  let itemCounts: Record<string, number> = {}
  for (const item of items) {
    if (item.aspects) {
      itemsWithAspects.push(item)
    } else {
      itemCounts[item.name] = (itemCounts[item.name] || 0) + (item.count || 1)
    }
  }
  const withCount: (T & { count: number })[] = []
  for (const [name, count] of Object.entries(itemCounts)) {
    withCount.push({ name, count } as T & { count: number })
  }
  for (const item of itemsWithAspects) {
    withCount.push({ ...item, count: item.count ?? 1 })
  }
  return withCount
}
