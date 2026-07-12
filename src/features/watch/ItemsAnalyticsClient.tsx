'use client'

import { ItemChart } from '@/app/(main)/watch/items/ItemChart'
import { useCatalog, useMeta } from '@/client/api/catalog'
import { useLeaderboard } from '@/client/api/watch'
import { QueryError, QueryLoading } from '@/components/api/QueryState'
import { DEFAULT_GAME_VERSION, getNumberOfRounds } from '@/game/gameVersion'
import { LEADERBOARD_TYPE_ACC } from '@/game/rules'
import { capitalCase } from 'change-case'
import { meanBy, orderBy, round, sumBy } from 'lodash-es'
import { useMemo } from 'react'

const chart = (
  title: string,
  valueLabel: string,
  values: Array<{ name: string; value: number }>,
  color: number,
  subTitle?: string,
) => ({
  title,
  valueLabel,
  subTitle,
  data: orderBy(
    values.map((value) => ({
      ...value,
      value: Number.isFinite(value.value) ? round(value.value, 2) : 0,
      fill: `hsl(var(--chart-${color}))`,
    })),
    (value) => value.value,
    'desc',
  ),
})

export const ItemsAnalyticsClient = () => {
  const meta = useMeta()
  const catalog = useCatalog(meta.data?.viewer?.themeId)
  const leaderboard = useLeaderboard({
    round: meta.data?.numberOfRounds ?? getNumberOfRounds(DEFAULT_GAME_VERSION),
    type: LEADERBOARD_TYPE_ACC,
  })

  const charts = useMemo(() => {
    if (!catalog.data || !leaderboard.data) return []
    const entries = leaderboard.data.entries
    const items = catalog.data.items.filter(
      (item) => !item.tags?.includes('hero'),
    )
    const ranked = items.map((item) => {
      const counts = entries.map((entry) => ({
        entry,
        count: sumBy(entry.loadout.items, (candidate) =>
          candidate.name === item.name ? candidate.count ?? 1 : 0,
        ),
      }))
      return { item, counts }
    })
    const attackItems = ranked
      .map(({ item, counts }) => {
        const attacks = item.triggers?.flatMap((trigger) =>
          trigger.type === 'interval' && trigger.attack ? [trigger] : [],
        )
        const damagePerSecond = sumBy(
          attacks,
          (attack) => (attack.attack?.damage ?? 0) / (attack.cooldown / 1_000),
        )
        const staminaPerSecond = sumBy(
          attacks,
          (attack) =>
            ((attack.statsSelf?.stamina ?? 0) / (attack.cooldown / 1_000)) * -1,
        )
        return {
          item,
          counts,
          damagePerSecond,
          staminaPerSecond,
          damagePerStamina: staminaPerSecond
            ? damagePerSecond / staminaPerSecond
            : 0,
          dpsPerGold: item.price ? damagePerSecond / item.price : 0,
        }
      })
      .filter((item) => item.damagePerSecond > 0)

    return [
      chart(
        'Total Count',
        'count',
        ranked.map(({ item, counts }) => ({
          name: capitalCase(item.name),
          value: meanBy(counts, ({ count }) => count),
        })),
        1,
        'Mean count in leaderboard builds',
      ),
      chart(
        'Total Count (ranked)',
        'points',
        ranked.map(({ item, counts }) => ({
          name: capitalCase(item.name),
          value: meanBy(
            counts,
            ({ count, entry }) => count * (entry.score - 50),
          ),
        })),
        1,
        'Count weighted by relative win rate',
      ),
      chart(
        'Build Count',
        'builds',
        ranked.map(({ item, counts }) => ({
          name: capitalCase(item.name),
          value: meanBy(counts, ({ count }) => (count ? 1 : 0)),
        })),
        1,
        'Fraction of builds containing this item',
      ),
      chart(
        'Build Count (ranked)',
        'points',
        ranked.map(({ item, counts }) => ({
          name: capitalCase(item.name),
          value: meanBy(counts, ({ count, entry }) =>
            count ? entry.score - 50 : 0,
          ),
        })),
        1,
        'Build share weighted by relative win rate',
      ),
      chart(
        'Gold',
        'gold',
        ranked.map(({ item, counts }) => ({
          name: capitalCase(item.name),
          value: meanBy(counts, ({ count }) => count * item.price),
        })),
        1,
        'Mean gold spent on this item',
      ),
      chart(
        'Gold (ranked)',
        'points',
        ranked.map(({ item, counts }) => ({
          name: capitalCase(item.name),
          value: meanBy(
            counts,
            ({ count, entry }) => count * item.price * (entry.score - 50),
          ),
        })),
        1,
        'Gold weighted by relative win rate',
      ),
      chart(
        'Damage per second',
        'dps',
        attackItems.map(({ item, damagePerSecond }) => ({
          name: capitalCase(item.name),
          value: damagePerSecond,
        })),
        2,
      ),
      chart(
        'Stamina per second',
        'stamina/s',
        attackItems.map(({ item, staminaPerSecond }) => ({
          name: capitalCase(item.name),
          value: staminaPerSecond,
        })),
        3,
      ),
      chart(
        'Damage per stamina',
        'damage/stamina',
        attackItems
          .filter(({ damagePerStamina }) => damagePerStamina > 0)
          .map(({ item, damagePerStamina }) => ({
            name: capitalCase(item.name),
            value: damagePerStamina,
          })),
        4,
      ),
      chart(
        'DPS per gold',
        'dps/gold',
        attackItems
          .filter(({ dpsPerGold }) => dpsPerGold > 0)
          .map(({ item, dpsPerGold }) => ({
            name: capitalCase(item.name),
            value: dpsPerGold,
          })),
        5,
      ),
    ]
  }, [catalog.data, leaderboard.data])

  if (catalog.isLoading || leaderboard.isLoading) {
    return <QueryLoading label="Loading item analytics…" />
  }
  if (catalog.error || leaderboard.error) {
    return (
      <QueryError
        error={catalog.error ?? leaderboard.error}
        retry={() => {
          catalog.refetch()
          leaderboard.refetch()
        }}
      />
    )
  }
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {charts.map((item) => (
        <ItemChart key={item.title} {...item} />
      ))}
    </div>
  )
}
