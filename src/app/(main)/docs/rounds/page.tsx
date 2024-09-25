import { RoundInfo } from '@/components/game/RoundInfo'
import { roundStats } from '@/game/roundStats'
import { Metadata } from 'next'
import { Fragment } from 'react'

export const metadata: Metadata = {
  title: 'Rounds',
}

export default async function Page() {
  return (
    <>
      <div className="flex flex-row xl:grid xl:grid-cols-5 xl:self-center gap-2 gap-y-8 flex-wrap justify-center">
        {roundStats.map((round) => {
          return (
            <Fragment key={round.roundNo}>
              <RoundInfo roundNo={round.roundNo} />
            </Fragment>
          )
        })}
      </div>
    </>
  )
}
