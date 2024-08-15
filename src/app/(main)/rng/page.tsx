import { rngFloat, rngOrder, SeedArray } from '@/game/seed'
import { range } from 'lodash-es'
import { Metadata } from 'next'
import { Fragment } from 'react'

export const metadata: Metadata = {
  title: 'rng',
}

const NO_OF_TESTS = 100

export default async function Page() {
  const simulationSeed: SeedArray = range(100)

  const floats = range(NO_OF_TESTS).map((idx) =>
    rngFloat({ seed: [...simulationSeed, idx] }),
  )
  const check = floats.filter((f) => f < 0.5).length / floats.length

  return (
    <>
      {check}
      <hr />
      {range(NO_OF_TESTS).map((idx) => (
        <Fragment key={idx}>
          <div>
            {rngOrder({ items: range(5), seed: [...simulationSeed, idx] })}
          </div>
        </Fragment>
      ))}
    </>
  )
}
