export const countifyItems = <T extends { name: string; count?: number }>(
  items: T[],
) => {
  let itemCounts: Record<string, number> = {}
  for (const item of items) {
    itemCounts[item.name] = (itemCounts[item.name] || 0) + (item.count || 1)
  }
  const withCount: (T & { count: number })[] = []
  for (const [name, count] of Object.entries(itemCounts)) {
    withCount.push({ name, count } as T & { count: number })
  }
  return withCount
}
