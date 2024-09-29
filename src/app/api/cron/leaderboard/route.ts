import { addToLeaderboard } from '@/game/addToLeaderboard'
import { NO_OF_ROUNDS } from '@/game/config'
import { getLeaderboard } from '@/game/getLeaderboard'
import { range } from 'lodash-es'
import { headers } from 'next/headers'

export const revalidate = 0
export const maxDuration = 900 // 15 minutes

export const GET = async () => {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    throw new Error('CRON_SECRET is not set')
  }

  const authHeader = headers().get('authorization')
  if (authHeader !== `Bearer ${cronSecret}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const CYCLES = 2

  console.time(`Leaderboard Cron: Total Time`)

  for (const roundNo of range(NO_OF_ROUNDS)) {
    console.log(`Leaderboard Cron: Round ${roundNo}`)
    console.log(
      `Leaderboard Cron: Starting (round ${roundNo}, ${CYCLES} cycles)`,
    )

    for (const cycle of range(1, CYCLES + 1)) {
      const leaderboard = await getLeaderboard({
        roundNo,
      })
      console.log(
        `Leaderboard Cron: Round ${roundNo} Cycle ${cycle}, ${leaderboard.length} Entries`,
      )

      for (const [idx, entry] of leaderboard.entries()) {
        const msg = `Leaderboard Cron: Round ${roundNo} Cycle ${cycle} Rank ${idx + 1}`
        console.time(msg)
        await addToLeaderboard({ loadout: entry.loadout })
        console.timeEnd(msg)
      }
    }

    console.log(`Leaderboard Cron: Round ${roundNo} Done`)
  }

  console.log(`Leaderboard Cron: Done`)
  console.timeEnd(`Leaderboard Cron: Total Time`)

  return new Response('OK')
}
