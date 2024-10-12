import { isDevDb } from '@/auth/dev'
import { notFoundIfNotAdmin } from '@/auth/getIsAdmin'
import { getMyUserIdOrThrow } from '@/auth/getMyUser'
import { SimpleDataCard } from '@/components/simple/SimpleDataCard'
import { getItemByName } from '@/game/allItems'
import { createGame } from '@/game/createGame'
import { countBy, map, orderBy, range } from 'lodash-es'
import { Fragment } from 'react'

export default async function Page() {
  const NO_OF_GAMES = 100
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
      (count, name) => ({ count, name }),
    ),
    'count',
    'desc',
  )

  const withItemDefs = await Promise.all(
    counts.map(async ({ name, count }) => {
      const def = await getItemByName(name)
      return { name, count, rarity: def.rarity }
    }),
  )

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
      <div className="grid grid-cols-4 gap-2">
        {withItemDefs.map((item) => (
          <Fragment key={item.name}>
            <SimpleDataCard data={item} />
          </Fragment>
        ))}
      </div>
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
