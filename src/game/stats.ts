import { constArrayMap } from '@/lib/constArrayMap'
import { Banana, Carrot, Heart, HelpCircle, Shield, Sword } from 'lucide-react'
import { z } from 'zod'

export const allStatsDefinition = [
  {
    name: 'health',
    icon: Heart,
    bgClass: 'bg-red-500',
    tooltip: 'Health points.',
  },
  {
    name: 'stamina',
    icon: Banana,
    bgClass: 'bg-yellow-500',
    tooltip: 'Stamina points.',
  },
  {
    name: 'staminaRegen',
    icon: Carrot,
    bgClass: 'bg-yellow-500',
    tooltip: 'Stamina points.',
  },
  {
    name: 'block',
    icon: Shield,
    bgClass: 'bg-cyan-500',
    tooltip: 'Prevents X damage this turn.',
  },
  {
    name: 'strength',
    icon: Sword,
    bgClass: 'bg-red-500',
    tooltip: 'Deal X more damage.',
  },
  {
    name: 'thorns',
    icon: HelpCircle,
    bgClass: 'bg-gray-500',
    tooltip: 'Deal X Damage to attacker when attacked.',
  },
  {
    name: 'regen',
    icon: HelpCircle,
    bgClass: 'bg-gray-500',
    tooltip: 'Regenerate X health per second.',
  },
] as const

export const getStatDefinition = (stat: Stat) => {
  const def = allStatsDefinition.find((b) => b.name === stat)
  if (!def) {
    throw new Error(`Unknown stat: ${stat}`)
  }
  return def
}

export const allStats = constArrayMap(allStatsDefinition, 'name')

export type Stat = (typeof allStats)[number]

// Construct an object schema with all keys required
const statsObjectSchema = allStats.reduce(
  (schema, buff) => {
    schema[buff] = z.number().optional()
    return schema
  },
  {} as { [K in (typeof allStats)[number]]: z.ZodOptional<z.ZodNumber> },
)

export const Stats = z.object(statsObjectSchema).default({})
export type Stats = z.infer<typeof Stats>
