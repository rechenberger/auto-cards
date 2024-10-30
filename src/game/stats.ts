import {
  ArrowBigUp,
  ArrowBigUpDash,
  Axe,
  Backpack,
  Banana,
  Beer,
  BicepsFlexed,
  Bird,
  Carrot,
  Clover,
  Coins,
  Cross,
  Crosshair,
  Droplet,
  Eye,
  EyeOff,
  Flame,
  Ham,
  Heart,
  HeartPulse,
  LucideIcon,
  Pyramid,
  Shield,
  ShieldOff,
  Skull,
  Snowflake,
  Sword,
  Syringe,
  Target,
  Weight,
} from 'lucide-react'
import { map } from 'remeda'
import { z } from 'zod'
import {
  COLLECTOR_PRICE_LIMIT,
  IGNORE_SPACE,
  MAX_THORNS_MULTIPLIER,
} from './config'
import { randomStatDefinitionsRaw } from './randomStats'

export type StatDefinitionPre = {
  name: string
  icon: LucideIcon
  bgClass: string
  tooltip: string
  bar?: boolean
  hidden?: boolean
  hideCount?: boolean
  subset?: StatDefinitionPost[]
}

type StatDefinitionPost = StatDefinitionPre & {
  name: Stat
}

export type StatDefinition = StatDefinitionPre

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
    icon: Cross,
    bgClass: 'bg-red-500',
    tooltip: 'Max Health points.',
    bar: true,
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
    bar: true,
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
    tooltip:
      'Last X seconds. When only one side is flying, only ranged weapons can hit.',
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
    name: 'empower',
    icon: ArrowBigUp,
    bgClass: 'bg-orange-500',
    tooltip: 'X more damage',
  },
  {
    name: 'drunk',
    icon: Beer,
    bgClass: 'bg-yellow-500',
    tooltip: '-X% accuracy. +X% damage. +X% faster food.',
  },
  {
    name: 'hungry',
    icon: Ham,
    bgClass: 'bg-amber-800',
    tooltip: '+X% faster food.',
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
  {
    name: 'unblockableChance',
    icon: ShieldOff,
    bgClass: 'bg-cyan-500',
    tooltip: 'X% chance to ignore block.',
  },
  {
    name: 'critChance',
    icon: Crosshair,
    bgClass: 'bg-red-500',
    tooltip: '+X% chance to crit.',
  },
  {
    name: 'mana',
    icon: Droplet,
    bgClass: 'bg-blue-500',
    tooltip: 'Mana is used for magic.',
  },
  {
    name: 'barrier',
    icon: Shield,
    bgClass: 'bg-blue-500',
    tooltip: 'Immune to ranged attacks for X seconds.',
  },
  {
    name: 'priority',
    icon: ArrowBigUpDash,
    bgClass: 'bg-rose-800',
    tooltip: 'Enemies attack the target with the highest priority first.',
  },
] as const satisfies StatDefinitionPre[]
export const allHeroStats = map(heroStats, (stat) => stat.name)
export const HeroStat = z.enum(allHeroStats)
export type HeroStat = z.infer<typeof HeroStat>

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
  {
    name: 'weight',
    icon: Weight,
    bgClass: 'bg-amber-600',
    tooltip: `Weight of the item. You can only carry a total of ${COLLECTOR_PRICE_LIMIT} weight.`,
  },
] as const satisfies StatDefinitionPre[]

export const allStatsDefinitionConst = [
  ...otherStats,
  ...heroStats,
  ...attackStats,
  ...randomStatDefinitionsRaw,
] as const satisfies StatDefinitionPre[]

export const allStatsDefinition: StatDefinitionPost[] = allStatsDefinitionConst

export const getStatDefinition = (stat: Stat) => {
  const def = allStatsDefinitionConst.find((b) => b.name === stat)
  if (!def) {
    throw new Error(`Unknown stat: ${stat}`)
  }
  return def as StatDefinitionPost
}

export const allStats = map(allStatsDefinitionConst, (def) => def.name)

export const Stat = z.enum(allStats)
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
