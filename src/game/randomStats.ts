import { capitalCase } from 'change-case'
import { map as lodashMap } from 'lodash-es'
import { CircleHelp, ShieldQuestion } from 'lucide-react'
import { map } from 'remeda'
import {
  randomBuffStats,
  randomDebuffStats,
  randomStats,
} from './randomStatRules'
import type { RandomStat } from './randomStatRules'
import type { HeroStat } from './statSchemas'
import type { StatDefinitionPre } from './stats'

export { randomStats }
export type { RandomStat }

type RandomStatDefinitionPre = StatDefinitionPre & {
  randomStats: readonly Partial<Record<HeroStat, number>>[]
}

const tooltip = (randomStats: readonly Partial<Record<HeroStat, number>>[]) => {
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
    randomStats: randomBuffStats,
    tooltip: tooltip(randomBuffStats),
  },
  {
    name: 'randomDebuff',
    icon: CircleHelp,
    bgClass: 'bg-gray-500',
    randomStats: randomDebuffStats,
    tooltip: tooltip(randomDebuffStats),
  },
] as const satisfies RandomStatDefinitionPre[]

type RandomStatDefinitionPost = RandomStatDefinitionPre & {
  name: RandomStat
}

export const randomStatDefinitions =
  randomStatDefinitionsRaw as readonly RandomStatDefinitionPost[]
