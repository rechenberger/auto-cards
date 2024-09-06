import { countifyItems } from './countifyItems'

type Items = {
  name: string
  count?: number
}[]

export const sumItems = (...items: Items[]) => {
  const all = items.flat()
  let result = countifyItems(all)
  result = result.filter((item) => item.count !== 0)
  const hasNegative = result.some((item) => item.count < 0)
  if (hasNegative) {
    throw new Error('Negative item count')
  }
  return result
}

export const negativeItems = (items: Items) => {
  return items.map((item) => ({
    ...item,
    count: item.count ? -1 * item.count : -1,
  }))
}
