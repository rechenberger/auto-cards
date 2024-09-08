import { LoadoutData } from '@/db/schema-zod'

export const encodeLoadout = (loadout: LoadoutData) => {
  return loadout.items
    .filter((item) => (item.count ?? 1) > 0)
    .map((item) => `${item.count ?? 1}:${item.name}`)
    .join(',')
}

export const encodeLoadouts = (loadouts: LoadoutData[]) => {
  return loadouts.map(encodeLoadout).join('~')
}

export const decodeLoadout = (encoded: string): LoadoutData => {
  const items = encoded.split(',').map((item) => {
    const [count, name] = item.split(':')
    return {
      name,
      count: Number(count),
    }
  })
  return {
    items,
  }
}

export const decodeLoadouts = (encoded: string): LoadoutData[] => {
  return encoded.split('~').map(decodeLoadout)
}

export const playgroundHref = ({ loadouts }: { loadouts: LoadoutData[] }) => {
  return `/playground?loadouts=${encodeLoadouts(loadouts)}`
}
