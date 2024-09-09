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

export type PlaygroundParams = {
  loadouts?: string
  seed?: string
  mode?: 'edit' | 'fight'
}

export type PlaygroundOptions = {
  loadouts: LoadoutData[]
  seed: string
  mode: 'edit' | 'fight'
}

export const playgroundHref = (options: PlaygroundOptions) => {
  const searchParams = new URLSearchParams()
  if (options.loadouts) {
    searchParams.set('loadouts', encodeLoadouts(options.loadouts))
  }
  if (options.seed) {
    searchParams.set('seed', options.seed)
  }
  if (options.mode) {
    searchParams.set('mode', options.mode)
  }
  return `/admin/playground?${searchParams.toString()}`
}

export const defaultLoadoutString = '1:hero'
export const defaultLoadoutsString = [
  defaultLoadoutString,
  defaultLoadoutString,
].join('~')

export const decodePlaygroundParams = (
  params: PlaygroundParams,
): PlaygroundOptions => {
  return {
    loadouts: decodeLoadouts(params.loadouts ?? defaultLoadoutsString),
    seed: params.seed ?? 'playground',
    mode: params.mode ?? 'edit',
  }
}
