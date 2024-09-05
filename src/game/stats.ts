import { constArrayMap } from '@/lib/constArrayMap'
import {
  Axe,
  Backpack,
  Banana,
  Beer,
  BicepsFlexed,
  Bird,
  Carrot,
  Clover,
  Coins,
  Crosshair,
  Eye,
  EyeOff,
  Flame,
  Heart,
  HeartPulse,
  LucideIcon,
  Pyramid,
  Shield,
  Skull,
  Snowflake,
  Sword,
  Syringe,
  Target,
  Triangle,
} from 'lucide-react'
import { z } from 'zod'
import { IGNORE_SPACE, MAX_THORNS_MULTIPLIER } from './config'

type StatDefinitionPre = {
  name: string
  icon: LucideIcon
  bgClass: string
  tooltip: string
  bar?: boolean
  hidden?: boolean
  hideCount?: boolean
}

type StatDefinitionPost = StatDefinitionPre & {
  name: Stat
}

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
    icon: BicepsFlexed,
    bgClass: 'bg-yellow-500',
    tooltip: 'Max Stamina points.',
    // hidden: true,
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
    tooltip: 'Prevents X damage from attacks.',
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
    tooltip: `Deal X Damage to attacker when attacked. Max ${MAX_THORNS_MULTIPLIER}x damage of the attacker.`,
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
  {
    name: 'aim',
    icon: Eye,
    bgClass: 'bg-blue-500',
    tooltip: 'X% chance to crit. Removed on crit.',
  },
  {
    name: 'drunk',
    icon: Beer,
    bgClass: 'bg-yellow-500',
    tooltip: '-X% accuracy. +X% damage. +X% faster food.',
  },
  {
    name: 'critDamage',
    icon: Axe,
    bgClass: 'bg-yellow-500',
    tooltip: '+X% crit damage.',
  },
  {
    name: 'ranged',
    icon: Target,
    bgClass: 'bg-red-500',
    tooltip: 'Can hit flying enemies. Not affected by thorns.',
    hideCount: true,
  },
  {
    name: 'scalesDamageWithThorns',
    icon: Triangle,
    bgClass: 'bg-red-500',
    tooltip: 'Deals 1 more damage for each thorns on you.',
    hideCount: true,
  },
  {
    name: 'blind',
    icon: EyeOff,
    bgClass: 'bg-amber-500',
    tooltip: 'Reduces accuracy by X%.',
  },
  {
    name: 'luck',
    icon: Clover,
    bgClass: 'bg-emerald-500',
    tooltip: 'Increases accuracy by X%.',
  },
] as const satisfies StatDefinitionPre[]

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
] as const satisfies StatDefinitionPre[]

const otherStats = [
  {
    name: 'gold',
    icon: Coins,
    bgClass: 'bg-yellow-500',
    tooltip: 'Money to buy stuff.',
  },
] as const satisfies StatDefinitionPre[]

export const allStatsDefinitionConst = [
  ...otherStats,
  ...heroStats,
  ...attackStats,
] as const satisfies StatDefinitionPre[]

export const allStatsDefinition: StatDefinitionPost[] = allStatsDefinitionConst

export const getStatDefinition = (stat: Stat) => {
  const def = allStatsDefinitionConst.find((b) => b.name === stat)
  if (!def) {
    throw new Error(`Unknown stat: ${stat}`)
  }
  return def as StatDefinitionPost
}

export const allStats = constArrayMap(allStatsDefinitionConst, 'name')

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
