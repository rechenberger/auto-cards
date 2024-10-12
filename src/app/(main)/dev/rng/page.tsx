import { isDevDb } from '@/auth/dev'
import { notFoundIfNotAdmin } from '@/auth/getIsAdmin'
import { getMyUserIdOrThrow } from '@/auth/getMyUser'
import { SimpleDataCard } from '@/components/simple/SimpleDataCard'
import { SimpleDataTableCard } from '@/components/simple/SimpleDataTable'
import { getItemByName } from '@/game/allItems'
import { NO_OF_SHOP_ITEMS } from '@/game/config'
import { createGame } from '@/game/createGame'
import { roundStats } from '@/game/roundStats'
import { capitalCase } from 'change-case'
import {
  countBy,
  groupBy,
  map,
  mapValues,
  orderBy,
  range,
  sum,
  sumBy,
  values,
} from 'lodash-es'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'RNG',
}

const formatPercent = (fraction: number) => `${(100 * fraction).toFixed(2)}%`

export default async function Page() {
  const noOfGames = 10_000
  const noOfShopItems = noOfGames * NO_OF_SHOP_ITEMS
  const roundNo = 0
  const { rarityWeights } = roundStats[roundNo]
  const rarityChances = mapValues(
    rarityWeights,
    (weight) => (weight ?? 0) / sum(values(rarityWeights)),
  )

  await notFoundIfNotAdmin({ allowDev: true })

  const userId = await getMyUserIdOrThrow()

  if (!isDevDb()) {
    return <>Only use this with local DB</>
  }
  const games = await Promise.all(
    range(noOfGames).map(async () => {
      return createGame({ userId, skipSave: true })
    }),
  )

  const counts = orderBy(
    map(
      countBy(
        games.flatMap((game) => game.data.shopItems),
        (i) => i.name,
      ),
      (count, name) => ({
        count,
        name,
        countRelative: formatPercent(count / noOfShopItems),
      }),
    ),
    'count',
    'desc',
  )

  const byItems = await Promise.all(
    counts.map(async ({ name, count, countRelative }) => {
      const def = await getItemByName(name)
      return { name, count, countRelative, rarity: def.rarity }
    }),
  )

  const noOfDifferentItems = byItems.length

  const byRarity = map(groupBy(byItems, 'rarity'), (items, rarity) => {
    const rarityChance = (rarityChances as any)[rarity]

    const count = sumBy(items, (i) => i.count)
    const countRelative = count / noOfShopItems

    const itemsCount = items.length
    const itemsCountRelative = itemsCount / noOfDifferentItems

    const representation = itemsCountRelative * 3

    // const adjusted = countRelative / representation

    return {
      rarity,
      rarityChance: formatPercent(rarityChance),
      count,
      countRelative: formatPercent(countRelative),
      itemsCount,
      itemsCountRelative: formatPercent(itemsCountRelative),
      representation: formatPercent(representation),
      // adjusted: formatPercent(adjusted),
    }
  })

  // const numbers = range(10000).map((idx) =>
  //   rngInt({
  //     seed: [
  //       'xsodhhjaspdioushdafpoujasdhfpaosdfhjsdoifhjasdfpoisadhf',
  //       idx,
  //       'asodhhjaspdioushdafpoujasdhfpaosdfhjsdoifhjasdfpoisadhf',
  //     ],
  //     min: 0,
  //     max: 100,
  //   }),
  // )

  return (
    <>
      <h1>Dev</h1>
      {/* <div className="grid grid-cols-4 gap-2">
        {withItemDefs.map((item) => (
          <Fragment key={item.name}>
            <SimpleDataCard data={item} />
          </Fragment>
        ))}
      </div> */}
      <SimpleDataCard
        data={{
          noOfGames,
          noOfShopItems,
          noOfDifferentItems,
        }}
        formatKey={capitalCase}
      />
      <SimpleDataTableCard
        title="Rarity"
        data={byRarity}
        formatKey={capitalCase}
      />
      <SimpleDataTableCard
        title="Shop Items"
        data={byItems}
        formatKey={capitalCase}
      />
      {/* <h1>Mean: {mean(numbers)}</h1>
      <div className="grid grid-cols-4 gap-2">
        {numbers.map((n, idx) => (
          <Fragment key={idx}>
            <div>{n}</div>
          </Fragment>
        ))}
      </div> */}
    </>
  )
}
