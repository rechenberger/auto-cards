import type { HeroStat } from './statSchemas'

export const randomBuffStats = [
  { thorns: 1 },
  { luck: 2 },
  { empower: 1 },
  { lifeSteal: 5 },
  { regen: 1 },
  { haste: 5 },
] as const satisfies readonly Partial<Record<HeroStat, number>>[]

export const randomDebuffStats = [
  { poison: 1 },
  { slow: 5 },
  { blind: 5 },
] as const satisfies readonly Partial<Record<HeroStat, number>>[]

export const randomStatRules = [
  {
    name: 'randomBuff',
    randomStats: randomBuffStats,
  },
  {
    name: 'randomDebuff',
    randomStats: randomDebuffStats,
  },
] as const

export const randomStats = ['randomBuff', 'randomDebuff'] as const
export type RandomStat = (typeof randomStatRules)[number]['name']
