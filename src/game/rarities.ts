import { map } from 'remeda'
import { z } from 'zod'

export const allRarityDefinitions = [
  {
    name: 'common',
    textClass: '',
    ringClass: '',
    bgClass: 'bg-gradient-to-br from-gray-500 to-neutral-500',
    aspects: {
      normal: 0,
    },
  },
  {
    name: 'uncommon',
    textClass: 'text-green-500',
    ringClass: 'ring-green-500',
    bgClass: 'bg-gradient-to-br from-lime-500/50 to-green-600/50',
    aspects: {
      normal: 1,
    },
  },
  {
    name: 'rare',
    textClass: 'text-blue-500',
    ringClass: 'ring-blue-500',
    bgClass: 'bg-gradient-to-br from-blue-500/50 to-indigo-600/50',
    aspects: {
      normal: 2,
    },
  },
  {
    name: 'epic',
    textClass: 'text-purple-500',
    ringClass: 'ring-purple-500',
    bgClass: 'bg-gradient-to-br from-pink-600/80 to-purple-600/80',
    aspects: {
      normal: 3,
    },
  },
  {
    name: 'legendary',
    textClass: 'text-amber-500',
    ringClass: 'ring-amber-500',
    bgClass: 'bg-gradient-to-br from-amber-500/80 to-orange-600/80',
    aspects: {
      normal: 4,
    },
  },
] as const

export const defaultRarity: Rarity = 'common'

export const getRarityDefinition = (rarity: Rarity = 'common') => {
  const def = allRarityDefinitions.find((b) => b.name === rarity)
  if (!def) {
    throw new Error(`Unknown rarity: ${rarity}`)
  }
  return def
}

export const allRarities = map(allRarityDefinitions, (def) => def.name)

export const Rarity = z.enum(allRarities)
export type Rarity = z.infer<typeof Rarity>

const statsObjectSchema = allRarities.reduce(
  (schema, rarity) => {
    schema[rarity] = z.number().optional()
    return schema
  },
  {} as { [K in (typeof allRarities)[number]]: z.ZodOptional<z.ZodNumber> },
)
export const RarityWeights = z.object(statsObjectSchema).default({})
export type RarityWeights = z.infer<typeof RarityWeights>
