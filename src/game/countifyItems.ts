import { countBy } from 'lodash-es'

export const countifyItems = <T extends { name: string }>(items: T[]) => {
  const itemsGrouped = countBy(items, 'name')
  const withCount: (T & { count: number })[] = []
  for (const [name, count] of Object.entries(itemsGrouped)) {
    withCount.push({ name, count } as T & { count: number })
  }
  return withCount
}
