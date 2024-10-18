import { capitalCase } from 'change-case'
import { map as lodashMap } from 'lodash-es'
import { CircleHelp, ShieldQuestion } from 'lucide-react'
import { map } from 'remeda'
import { HeroStat, StatDefinitionPre } from './stats'

type RandomStatDefinitionPre = StatDefinitionPre & {
  randomStats: Partial<Record<HeroStat, number>>[]
}

const randomBuffRandomStats = [
  {
    thorns: 1,
  },
  {
    luck: 2,
  },
  {
    empower: 1,
  },
  {
    lifeSteal: 5,
  },
  {
    regen: 1,
  },
  {
    haste: 5,
  },
  // {
  //   drunk: 1,
  // },
]

const randomDebuffRandomStats = [
  {
    poison: 1,
  },
  {
    slow: 5,
  },
  {
    blind: 5,
  },
]

const tooltip = (randomStats: Partial<Record<HeroStat, number>>[]) => {
  return `${map(randomStats, (r) =>
    lodashMap(r, (value, stat) => `${value} ${capitalCase(stat)}`).join(
      ' and ',
    ),
  ).join(' or ')}`
}

export const randomStatDefinitionsRaw = [
  {
    name: 'randomBuff',
    icon: ShieldQuestion,
    bgClass: 'bg-gray-500',
    randomStats: randomBuffRandomStats,
    tooltip: tooltip(randomBuffRandomStats),
  },
  {
    name: 'randomDebuff',
    icon: CircleHelp,
    bgClass: 'bg-gray-500',
    randomStats: randomDebuffRandomStats,
    tooltip: tooltip(randomDebuffRandomStats),
  },
] as const satisfies RandomStatDefinitionPre[]

export const randomStats = map(randomStatDefinitionsRaw, (def) => def.name)
export type RandomStat = (typeof randomStats)[number]

type RandomStatDefinitionPost = RandomStatDefinitionPre & {
  name: RandomStat
}

export const randomStatDefinitions =
  randomStatDefinitionsRaw as RandomStatDefinitionPost[]
