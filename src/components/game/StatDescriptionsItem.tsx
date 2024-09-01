import { getItemByName } from '@/game/allItems'
import { Stat } from '@/game/stats'
import { keys, uniq } from 'lodash-es'
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
    ]) ?? []),
  ]
  const allStatKeys = uniq(allStats.map((s) => keys(s)).flat()) as Stat[]

  return <StatDescriptions stats={allStatKeys} />
}
