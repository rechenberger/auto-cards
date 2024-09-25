import { RoundInfo } from '@/components/game/RoundInfo'
import { NO_OF_ROUNDS } from '@/game/config'
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
          if (round.roundNo >= NO_OF_ROUNDS) return null
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
