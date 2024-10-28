import { getItemByName } from '@/game/allItems'
import { itemAspectsToTriggers } from '@/game/aspects'
import { Stat } from '@/game/stats'
import { flatMap, keys, map, uniq } from 'lodash-es'
import { ItemData } from './ItemData'
import { StatDescriptions } from './StatDescriptions'

export const StatDescriptionsItem = async ({
  itemData,
}: {
  itemData: ItemData
}) => {
  const item = await getItemByName(itemData.name)

  let triggers = item.triggers ?? []
  if (itemData.aspects) {
    triggers = [...triggers, ...itemAspectsToTriggers(itemData.aspects)]
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
