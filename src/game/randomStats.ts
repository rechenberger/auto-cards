import { constArrayMap } from '@/lib/constArrayMap'
import { CircleHelp, ShieldQuestion } from 'lucide-react'
import { HeroStat, StatDefinitionPre } from './stats'

type RandomStatDefinitionPre = StatDefinitionPre & {
  randomStats: Partial<Record<HeroStat, number>>[]
}

export const randomStatDefinitionsRaw = [
  {
    name: 'randomBuff',
    icon: ShieldQuestion,
    bgClass: 'bg-gray-500',
    tooltip: 'Applies a random Buff',
    randomStats: [
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
    ],
  },
  {
    name: 'randomDebuff',
    icon: CircleHelp,
    bgClass: 'bg-gray-500',
    tooltip: 'Applies a random Debuff',
    randomStats: [
      {
        poison: 1,
      },
      {
        slow: 5,
      },
      {
        blind: 5,
      },
    ],
  },
] as const satisfies RandomStatDefinitionPre[]

export const randomStats = constArrayMap(randomStatDefinitionsRaw, 'name')
export type RandomStat = (typeof randomStats)[number]

type RandomStatDefinitionPost = RandomStatDefinitionPre & {
  name: RandomStat
}

// export const randomStatDefinitions = randomStatDefinitionsRaw.map(
//   (def) =>
//     ({
//       name: def.name,
//       icon: def.icon,
//       bgClass: def.bgClass,
//       tooltip: `Random: ${map(def.randomStats, (value, stat) => `${value} ${stat}`).join(' or ')}`,
//     }) as const satisfies StatDefinitionPre,
// )

export const randomStatDefinitions =
  randomStatDefinitionsRaw as RandomStatDefinitionPost[]
