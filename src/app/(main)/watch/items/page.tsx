import { getAllItems } from '@/game/allItems'
import { getLeaderboardRanked } from '@/game/getLeaderboard'
import { capitalCase } from 'change-case'
import { orderBy, sumBy } from 'lodash-es'
import { Metadata } from 'next'
import { ItemChart } from './ItemChart'

export const metadata: Metadata = {
  title: 'Best Items',
}

export default async function Page() {
  const entries = await getLeaderboardRanked({})

  let items = await getAllItems()

  items = items.filter((item) => !item.tags?.includes('hero'))

  const itemsRanked = items.map((item) => {
    const entriesWithCount = entries.map((entry) => {
      const count = sumBy(entry.loadout.data.items, (i) =>
        i.name === item.name ? (i.count ?? 1) : 0,
      )
      return {
        ...entry,
        count,
      }
    })
    const totalCount = sumBy(entriesWithCount, (e) => e.count)
    return {
      item,
      entriesWithCount,
      totalCount,
    }
  })

  return (
    <>
      <ItemChart
        title="Leaderboard Items"
        valueLabel="Total Count"
        data={orderBy(
          itemsRanked.map((item) => ({
            name: capitalCase(item.item.name),
            value: item.totalCount,
            fill: 'hsl(var(--chart-1))',
          })),
          (i) => i.value,
          'desc',
        )}
      />
    </>
  )
}
