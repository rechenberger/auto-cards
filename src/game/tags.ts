import { constArrayMap } from '@/lib/constArrayMap'
import { z } from 'zod'

export const allTagsDefinition = [
  {
    name: 'hero',
    bgClass: '',
  },
  {
    name: 'weapon',
    bgClass: 'bg-red-500/50',
  },
  {
    name: 'shield',
    bgClass: 'bg-amber-500',
  },
  {
    name: 'food',
    bgClass: 'bg-green-500/50',
  },
  {
    name: 'accessory',
    bgClass: 'bg-sky-500/50',
  },
  {
    name: 'crystal',
    bgClass: 'bg-sky-500',
  },
  {
    name: 'event',
    bgClass: 'bg-purple-500/50',
  },
  {
    name: 'potion',
    bgClass: 'bg-yellow-500/50',
  },
  {
    name: 'default',
    bgClass: '',
  },
  {
    name: 'bag',
    bgClass: 'bg-amber-600/50',
  },
  {
    name: 'deprecated',
    bgClass: 'bg-gray-500/20',
  },
] as const

export const getTagDefinition = (stat: Tag) => {
  const def = allTagsDefinition.find((b) => b.name === stat)
  if (!def) {
    throw new Error(`Unknown stat: ${stat}`)
  }
  return def
}

export const allTags = constArrayMap(allTagsDefinition, 'name')

export const Tag = z.enum(allTags)
export type Tag = z.infer<typeof Tag>
