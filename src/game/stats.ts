import { constArrayMap } from '@/lib/constArrayMap'
import {
  Backpack,
  Banana,
  Bird,
  Carrot,
  Coins,
  Crosshair,
  Flame,
  Heart,
  HeartPulse,
  Pyramid,
  Shield,
  Skull,
  Snowflake,
  Sword,
  Syringe,
} from 'lucide-react'
import { z } from 'zod'
import { IGNORE_SPACE } from './config'

const heroStats = [
  {
    name: 'health',
    icon: Heart,
    bgClass: 'bg-red-500',
    tooltip: 'Health points.',
    bar: true,
  },
  {
    name: 'healthMax',
    icon: Heart,
    bgClass: 'bg-red-500',
    tooltip: 'Max Health points.',
    hidden: true,
  },
  {
    name: 'space',
    icon: Backpack,
    bgClass: 'bg-yellow-800',
    tooltip: 'Space for cards.',
    hidden: IGNORE_SPACE,
  },
  {
    name: 'stamina',
    icon: Banana,
    bgClass: 'bg-yellow-500',
    tooltip: 'Stamina points.',
    bar: true,
  },
  {
    name: 'staminaMax',
    icon: Banana,
    bgClass: 'bg-yellow-500',
    tooltip: 'Max Stamina points.',
    hidden: true,
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
    icon: Pyramid,
    bgClass: 'bg-orange-500',
    tooltip: 'Deal X Damage to attacker when attacked.',
  },
  {
    name: 'lifeSteal',
    icon: Syringe,
    bgClass: 'bg-fuchsia-800',
    tooltip: 'Heal x% of the damage when attacking.',
  },
  {
    name: 'regen',
    icon: HeartPulse,
    bgClass: 'bg-red-500',
    tooltip: 'Regenerate X health per second.',
  },
  {
    name: 'poison',
    icon: Skull,
    bgClass: 'bg-green-500',
    tooltip: 'Lose X health per second.',
  },
  {
    name: 'flying',
    icon: Bird,
    bgClass: 'bg-sky-500',
    tooltip: 'Last X seconds. Can only be hit if enemy is also flying',
  },
  {
    name: 'haste',
    icon: Flame,
    bgClass: 'bg-red-700',
    tooltip: 'Everything triggers X% faster.',
  },
  {
    name: 'slow',
    icon: Snowflake,
    bgClass: 'bg-sky-300',
    tooltip: 'Everything triggers X% slower.',
  },
] as const

const attackStats = [
  {
    name: 'damage',
    icon: Sword,
    bgClass: 'bg-red-500',
    tooltip: 'Deal X damage.',
  },
  {
    name: 'accuracy',
    icon: Crosshair,
    bgClass: 'bg-yellow-500',
    tooltip: 'X% chance to hit.',
  },
] as const

const otherStats = [
  {
    name: 'gold',
    icon: Coins,
    bgClass: 'bg-yellow-500',
    tooltip: 'Money to buy stuff.',
  },
] as const

export const allStatsDefinition = [
  ...otherStats,
  ...heroStats,
  ...attackStats,
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
