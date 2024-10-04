import { LoadoutData } from '@/db/schema-zod'
import { getItemByName } from '@/game/allItems'
import { calcStats } from '@/game/calcStats'
import { sumBy } from 'lodash-es'
import { SimpleDataCard } from '../simple/SimpleDataCard'

export const LoadoutStaminaInfo = async ({
  loadout,
}: {
  loadout: LoadoutData
}) => {
  const items = await Promise.all(
    loadout.items.map(async (i) => {
      const item = await getItemByName(i.name)
      return {
        item,
        ...i,
      }
    }),
  )

  const staminasPerSecond = items.flatMap((item) => {
    return (
      item.item.triggers?.flatMap((trigger) => {
        if (trigger.type !== 'interval') return []
        const stamina = trigger.statsSelf?.stamina ?? 0
        if (!stamina) return []
        const staminaPerSecond = stamina / (trigger.cooldown / 1000)
        return [{ staminaPerSecond, tags: item.item.tags }]
      }) ?? []
    )
  })

  const stats = await calcStats({ loadout })
  const regen = stats?.staminaRegen ?? 0
  const food = sumBy(
    staminasPerSecond.filter((s) => s.tags?.includes('food')),
    (s) => s.staminaPerSecond,
  )
  const weapons = sumBy(
    staminasPerSecond.filter((s) => s.tags?.includes('weapon')),
    (s) => s.staminaPerSecond,
  )
  return (
    <>
      <div className="self-center">
        <SimpleDataCard
          data={{
            regen: regen.toFixed(1),
            food: food.toFixed(1),
            weapons: weapons.toFixed(1),
          }}
        />
      </div>
    </>
  )
}
