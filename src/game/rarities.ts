import { constArrayMap } from '@/lib/constArrayMap'
import { z } from 'zod'

export const allRarityDefinitions = [
  {
    name: 'common',
    textClass: 'text-gray-500',
  },
  {
    name: 'uncommon',
    textClass: 'text-green-500',
  },
  {
    name: 'rare',
    textClass: 'text-blue-500',
  },
  {
    name: 'epic',
    textClass: 'text-purple-500',
  },
  {
    name: 'legendary',
    textClass: 'text-yellow-500',
  },
] as const

export const getRarityDefinition = (rarity: Rarity) => {
  const def = allRarityDefinitions.find((b) => b.name === rarity)
  if (!def) {
    throw new Error(`Unknown rarity: ${rarity}`)
  }
  return def
}

export const allRarities = constArrayMap(allRarityDefinitions, 'name')

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
