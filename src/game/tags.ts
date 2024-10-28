import { map } from 'remeda'
import { z } from 'zod'

type TagDefinitionRaw = {
  name: string
  bgClass?: string
  textClass?: string
  locked?: boolean
  isSpecial?: boolean
}

const allTagDefinitionsRaw = [
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
    textClass: 'text-red-500',
  },
  {
    name: 'shield',
    bgClass: 'bg-amber-500',
    textClass: 'text-amber-500',
  },
  {
    name: 'food',
    bgClass: 'bg-green-500/50',
    textClass: 'text-green-500',
  },
  {
    name: 'friend',
    bgClass: 'bg-teal-500/50',
    textClass: 'text-teal-500',
  },
  {
    name: 'accessory',
    bgClass: 'bg-sky-500/50',
    textClass: 'text-sky-500',
  },
  {
    name: 'crystal',
    bgClass: 'bg-sky-500',
    textClass: 'text-sky-500',
  },
  {
    name: 'spell',
    bgClass: 'bg-indigo-700',
    textClass: 'text-indigo-700',
  },
  {
    name: 'event',
    bgClass: 'bg-purple-500/50',
    textClass: 'text-purple-500',
  },
  {
    name: 'potion',
    bgClass: 'bg-yellow-500/50',
    textClass: 'text-yellow-500',
  },
  {
    name: 'default',
    bgClass: '',
  },
  {
    name: 'bag',
    bgClass: 'bg-amber-600/50',
    textClass: 'text-amber-600',
  },
  {
    name: 'deprecated',
    bgClass: 'bg-gray-500/20',
    textClass: 'text-gray-500',
  },
  {
    name: 'farming',
    bgClass: 'bg-amber-500/50',
    textClass: 'text-amber-500',
    locked: true,
  },
  {
    name: 'smithing',
    bgClass: 'bg-amber-500/50',
    textClass: 'text-amber-500',
    locked: true,
  },
  {
    name: 'hunting',
    bgClass: 'bg-amber-500/50',
    textClass: 'text-amber-500',
    locked: true,
  },
] as const satisfies TagDefinitionRaw[]

export const allTags = map(allTagDefinitionsRaw, (t) => t.name)

export const Tag = z.enum(allTags)
export type Tag = z.infer<typeof Tag>

export type TagDefinition = Omit<TagDefinitionRaw, 'name'> & {
  name: Tag
}

export const allTagDefinitions: TagDefinition[] = allTagDefinitionsRaw

export const getTagDefinition = (tag: Tag): TagDefinition => {
  const def = allTagDefinitionsRaw.find((b) => b.name === tag)
  if (!def) {
    throw new Error(`Unknown tag: ${tag}`)
  }
  return def
}
