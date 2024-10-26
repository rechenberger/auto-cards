import { getItemByName } from '@/game/allItems'
import { ItemAspect, itemAspectsToTriggers } from '@/game/aspects'
import { Stat } from '@/game/stats'
import { flatMap, keys, map, uniq } from 'lodash-es'
import { StatDescriptions } from './StatDescriptions'

export const StatDescriptionsItem = async ({
  name,
  aspects,
}: {
  name: string
  aspects?: ItemAspect[]
}) => {
  const item = await getItemByName(name)

  let triggers = item.triggers ?? []
  if (aspects) {
    triggers = [...triggers, ...itemAspectsToTriggers(aspects)]
  }

  const allStats = [
    item.stats,
    item.statsItem,
    ...(triggers.flatMap((t) => [
      t.statsSelf,
      t.statsRequired,
      t.statsRequiredTarget,
      t.statsEnemy,
      t.statsTarget,
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
