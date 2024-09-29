import { getAllItems } from '@/game/allItems'
import { LEADERBOARD_LIMIT } from '@/game/config'
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
    return {
      item,
      entriesWithCount,
    }
  })

  return (
    <>
      <div className="grid xl:grid-cols-2 gap-4">
        <ItemChart
          title="Total Count"
          subTitle="count in leaderboard"
          valueLabel="count"
          data={orderBy(
            itemsRanked.map((item) => ({
              name: capitalCase(item.item.name),
              value: sumBy(item.entriesWithCount, (e) => e.count),
              fill: 'hsl(var(--chart-1))',
            })),
            (i) => i.value,
            'desc',
          )}
        />
        <ItemChart
          title="Total Count (ranked)"
          subTitle={`count in leaderboard and multiply by ${LEADERBOARD_LIMIT} minus rank`}
          valueLabel="points"
          data={orderBy(
            itemsRanked.map((item) => ({
              name: capitalCase(item.item.name),
              value: sumBy(
                item.entriesWithCount,
                (e) => e.count * (LEADERBOARD_LIMIT - e.rank),
              ),
              fill: 'hsl(var(--chart-1))',
            })),
            (i) => i.value,
            'desc',
          )}
        />
        <ItemChart
          title="Build Count"
          subTitle="count builds that have this item"
          valueLabel="builds"
          data={orderBy(
            itemsRanked.map((item) => ({
              name: capitalCase(item.item.name),
              value: sumBy(item.entriesWithCount, (e) => (e.count ? 1 : 0)),
              fill: 'hsl(var(--chart-1))',
            })),
            (i) => i.value,
            'desc',
          )}
        />
        <ItemChart
          title="Build Count (ranked)"
          subTitle={`count builds that have this item and multiply by ${LEADERBOARD_LIMIT} minus rank`}
          valueLabel="points"
          data={orderBy(
            itemsRanked.map((item) => ({
              name: capitalCase(item.item.name),
              value: sumBy(item.entriesWithCount, (e) =>
                e.count ? LEADERBOARD_LIMIT - e.rank : 0,
              ),
              fill: 'hsl(var(--chart-1))',
            })),
            (i) => i.value,
            'desc',
          )}
        />
        <ItemChart
          title="Gold"
          subTitle="gold spent on this item"
          valueLabel="gold"
          data={orderBy(
            itemsRanked.map((item) => ({
              name: capitalCase(item.item.name),
              value: sumBy(
                item.entriesWithCount,
                (e) => e.count * item.item.price,
              ),
              fill: 'hsl(var(--chart-1))',
            })),
            (i) => i.value,
            'desc',
          )}
        />
        <ItemChart
          title="Gold (ranked)"
          subTitle={`gold spent on this item and multiply by ${LEADERBOARD_LIMIT} minus rank`}
          valueLabel="points"
          data={orderBy(
            itemsRanked.map((item) => ({
              name: capitalCase(item.item.name),
              value: sumBy(
                item.entriesWithCount,
                (e) => e.count * item.item.price * (LEADERBOARD_LIMIT - e.rank),
              ),
              fill: 'hsl(var(--chart-1))',
            })),
            (i) => i.value,
            'desc',
          )}
        />
      </div>
    </>
  )
}
