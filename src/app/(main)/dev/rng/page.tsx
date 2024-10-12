import { isDevDb } from '@/auth/dev'
import { notFoundIfNotAdmin } from '@/auth/getIsAdmin'
import { getMyUserIdOrThrow } from '@/auth/getMyUser'
import { SimpleDataCard } from '@/components/simple/SimpleDataCard'
import { SimpleDataTableCard } from '@/components/simple/SimpleDataTable'
import { getItemByName } from '@/game/allItems'
import { NO_OF_SHOP_ITEMS } from '@/game/config'
import { createGame } from '@/game/createGame'
import { capitalCase } from 'change-case'
import { countBy, groupBy, map, orderBy, range, sumBy } from 'lodash-es'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'RNG',
}

export default async function Page() {
  const NO_OF_GAMES = 10_000
  const NO_OF_ITEMS = NO_OF_GAMES * NO_OF_SHOP_ITEMS

  await notFoundIfNotAdmin({ allowDev: true })

  const userId = await getMyUserIdOrThrow()

  if (!isDevDb()) {
    return <>Only use this with local DB</>
  }
  const games = await Promise.all(
    range(NO_OF_GAMES).map(async () => {
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
        countRelative: `${((100 * count) / NO_OF_ITEMS).toFixed(2)}%`,
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

  const byRarity = map(groupBy(byItems, 'rarity'), (items, rarity) => {
    const count = sumBy(items, (i) => i.count)
    const countRelative = `${((100 * count) / NO_OF_ITEMS).toFixed(2)}%`

    return {
      rarity,
      count,
      countRelative,
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
          NO_OF_GAMES,
          NO_OF_ITEMS,
        }}
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
