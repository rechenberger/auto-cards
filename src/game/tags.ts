import { constArrayMap } from '@/lib/constArrayMap'
import { z } from 'zod'

type TagDefinitionRaw = {
  name: string
  bgClass?: string
  locked?: boolean
  isSpecial?: boolean
}

export const allTagsDefinition = [
  {
    name: 'hero',
    bgClass: '',
  },
  {
    name: 'profession',
    bgClass: '',
    isSpecial: true,
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
    name: 'friend',
    bgClass: 'bg-teal-500/50',
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
  {
    name: 'farming',
    bgClass: 'bg-amber-500/50',
    locked: true,
  },
  {
    name: 'smithing',
    bgClass: 'bg-amber-500/50',
    locked: true,
  },
  {
    name: 'hunting',
    bgClass: 'bg-amber-500/50',
    locked: true,
  },
] as const satisfies TagDefinitionRaw[]

export const allTags = constArrayMap(allTagsDefinition, 'name')

export const Tag = z.enum(allTags)
export type Tag = z.infer<typeof Tag>

export type TagDefinition = Omit<TagDefinitionRaw, 'name'> & {
  name: Tag
}

export const getTagDefinition = (tag: Tag): TagDefinition => {
  const def = allTagsDefinition.find((b) => b.name === tag)
  if (!def) {
    throw new Error(`Unknown tag: ${tag}`)
  }
  return def
}
