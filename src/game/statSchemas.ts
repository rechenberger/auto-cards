import { z } from 'zod'

export const allHeroStats = [
  'health',
  'healthMax',
  'space',
  'stamina',
  'staminaMax',
  'staminaRegen',
  'block',
  'strength',
  'thorns',
  'lifeSteal',
  'regen',
  'poison',
  'flying',
  'haste',
  'slow',
  'aim',
  'empower',
  'drunk',
  'hungry',
  'critDamage',
  'ranged',
  'blind',
  'luck',
  'unblockableChance',
  'critChance',
  'mana',
  'barrier',
  'priority',
] as const

export const HeroStat = z.enum(allHeroStats)
export type HeroStat = z.infer<typeof HeroStat>

export const allAttackStats = ['damage', 'accuracy'] as const
export const allOtherStats = ['gold', 'weight'] as const
export const allRandomStats = ['randomBuff', 'randomDebuff'] as const

export const allStats = [
  ...allOtherStats,
  ...allHeroStats,
  ...allAttackStats,
  ...allRandomStats,
] as const

export const Stat = z.enum(allStats)
export type Stat = z.infer<typeof Stat>

const statsObjectSchema = allStats.reduce(
  (schema, stat) => {
    schema[stat] = z.number().optional()
    return schema
  },
  {} as { [K in Stat]: z.ZodOptional<z.ZodNumber> },
)

export const Stats = z.object(statsObjectSchema).default({})
export type Stats = z.infer<typeof Stats>
