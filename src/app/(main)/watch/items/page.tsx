import { getAllItems } from '@/game/allItems'
import { getLeaderboardRanked } from '@/game/getLeaderboard'
import { capitalCase } from 'change-case'
import { meanBy, orderBy, round, sumBy } from 'lodash-es'
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

  const itemsWithAttack = itemsRanked
    .map((item) => {
      const attacks = item.item.triggers?.flatMap((t) =>
        t.type === 'interval' && t.attack ? t : [],
      )
      const damagePerSecond = round(
        sumBy(attacks, (a) => (a.attack?.damage ?? 0) / (a.cooldown / 1000)),
        2,
      )
      const staminaPerSecond = round(
        sumBy(
          attacks,
          (a) => ((a.statsSelf?.stamina ?? 0) / (a.cooldown / 1000)) * -1,
        ),
        2,
      )
      const damagePerStamina = staminaPerSecond
        ? round(damagePerSecond / staminaPerSecond, 2)
        : 0

      return {
        ...item,
        damagePerSecond,
        staminaPerSecond,
        damagePerStamina,
      }
    })
    .filter((item) => item.damagePerSecond > 0)

  return (
    <>
      <div className="grid xl:grid-cols-2 gap-4">
        <ItemChart
          title="Total Count"
          subTitle="mean count in leaderboard"
          valueLabel="count"
          data={orderBy(
            itemsRanked.map((item) => ({
              name: capitalCase(item.item.name),
              value: round(
                meanBy(item.entriesWithCount, (e) => e.count),
                2,
              ),
              fill: 'hsl(var(--chart-1))',
            })),
            (i) => i.value,
            'desc',
          )}
        />
        <ItemChart
          title="Total Count (ranked)"
          subTitle={`mean count in leaderboard and multiplied by relative win-rate`}
          valueLabel="points"
          data={orderBy(
            itemsRanked.map((item) => ({
              name: capitalCase(item.item.name),
              value: round(
                meanBy(
                  item.entriesWithCount,
                  (e) => e.count * ((e.score - 50) / 100),
                ),
                2,
              ),
              fill: 'hsl(var(--chart-1))',
            })),
            (i) => i.value,
            'desc',
          )}
        />
        <ItemChart
          title="Build Count"
          subTitle="fraction of builds that have this item"
          valueLabel="builds"
          data={orderBy(
            itemsRanked.map((item) => ({
              name: capitalCase(item.item.name),
              value: round(
                meanBy(item.entriesWithCount, (e) => (e.count ? 1 : 0)),
                2,
              ),
              fill: 'hsl(var(--chart-1))',
            })),
            (i) => i.value,
            'desc',
          )}
        />
        <ItemChart
          title="Build Count (ranked)"
          subTitle={`fraction of builds that have this item and multiplied by relative win-rate`}
          valueLabel="points"
          data={orderBy(
            itemsRanked.map((item) => ({
              name: capitalCase(item.item.name),
              value: round(
                meanBy(item.entriesWithCount, (e) =>
                  e.count ? (e.score - 50) / 100 : 0,
                ),
                2,
              ),
              fill: 'hsl(var(--chart-1))',
            })),
            (i) => i.value,
            'desc',
          )}
        />
        <ItemChart
          title="Gold"
          subTitle="mean gold spent on this item"
          valueLabel="gold"
          data={orderBy(
            itemsRanked.map((item) => ({
              name: capitalCase(item.item.name),
              value: round(
                meanBy(item.entriesWithCount, (e) => e.count * item.item.price),
                2,
              ),
              fill: 'hsl(var(--chart-1))',
            })),
            (i) => i.value,
            'desc',
          )}
        />
        <ItemChart
          title="Gold (ranked)"
          subTitle={`mean gold spent on this item and multiplied by relative win-rate`}
          valueLabel="points"
          data={orderBy(
            itemsRanked.map((item) => ({
              name: capitalCase(item.item.name),
              value: round(
                meanBy(
                  item.entriesWithCount,
                  (e) => e.count * item.item.price * ((e.score - 50) / 100),
                ),
                2,
              ),
              fill: 'hsl(var(--chart-1))',
            })),
            (i) => i.value,
            'desc',
          )}
        />
        <ItemChart
          title="Damage per second"
          valueLabel="dps"
          data={orderBy(
            itemsWithAttack.map((item) => ({
              name: capitalCase(item.item.name),
              value: item.damagePerSecond,
              fill: 'hsl(var(--chart-2))',
            })),
            (i) => i.value,
            'desc',
          )}
        />
        <ItemChart
          title="Stamina per second"
          valueLabel="stamina/s"
          data={orderBy(
            itemsWithAttack.map((item) => ({
              name: capitalCase(item.item.name),
              value: item.staminaPerSecond,
              fill: 'hsl(var(--chart-3))',
            })),
            (i) => i.value,
            'desc',
          )}
        />
        <ItemChart
          title="Damage per stamina"
          valueLabel="damage/stamina"
          data={orderBy(
            itemsWithAttack
              .filter((item) => item.damagePerStamina > 0)
              .map((item) => ({
                name: capitalCase(item.item.name),
                value: item.damagePerStamina,
                fill: 'hsl(var(--chart-4))',
              })),
            (i) => i.value,
            'desc',
          )}
        />
      </div>
    </>
  )
}
