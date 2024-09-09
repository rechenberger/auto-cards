import { getItemByName } from '@/game/allItems'
import { Stat } from '@/game/stats'
import { flatMap, keys, map, uniq } from 'lodash-es'
import { StatDescriptions } from './StatDescriptions'

export const StatDescriptionsItem = async ({ name }: { name: string }) => {
  const item = await getItemByName(name)

  const allStats = [
    item.stats,
    item.statsItem,
    ...(item.triggers?.flatMap((t) => [
      t.statsSelf,
      t.statsEnemy,
      t.statsItem,
      t.attack,
      ...map(t.modifiers, (m) => ({ [m.targetStat]: 1 })),
      ...flatMap(t.modifiers, (m) =>
        map(m.valueAddingStats, (s) => ({ [s]: 1 })),
      ),
    ]) ?? []),
  ]
  const allStatKeys = uniq(allStats.map((s) => keys(s)).flat()) as Stat[]

  return <StatDescriptions stats={allStatKeys} />
}
