import { addToLeaderboard } from '@/game/addToLeaderboard'
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

  console.log(`Leaderboard Cron: Starting (${CYCLES} cycles)`)
  console.time(`Leaderboard Cron: Total Time`)

  for (const cycle of range(1, CYCLES + 1)) {
    const leaderboard = await getLeaderboard({})
    console.log(
      `Leaderboard Cron: Cycle ${cycle}, ${leaderboard.length} Entries`,
    )

    for (const [idx, entry] of leaderboard.entries()) {
      const msg = `Leaderboard Cron: Cycle ${cycle} Rank ${idx + 1}`
      console.time(msg)
      await addToLeaderboard({ loadout: entry.loadout })
      console.timeEnd(msg)
    }
  }

  console.log(`Leaderboard Cron: Done`)
  console.timeEnd(`Leaderboard Cron: Total Time`)

  return new Response('OK')
}
