import { isDev } from '@/auth/dev'
import { generateMatch } from '@/game/generateMatch'
import { getLeaderboardRanked } from '@/game/getLeaderboard'

export const revalidate = 0
export const GET = async () => {
  if (!isDev()) {
    return new Response('Not allowed', { status: 403 })
  }

  const leaderboard = await getLeaderboardRanked({})
  const seed = ['dev']

  const matchups = leaderboard.flatMap((entry) => {
    const blue = entry
    return leaderboard.map((red) => {
      return {
        blue,
        red,
      }
    })
  })

  const start = Date.now()
  const matchResults = matchups.map(({ blue, red }) => {
    const result = generateMatch({
      skipLogs: true,
      participants: [
        { loadout: blue.loadout.data },
        { loadout: red.loadout.data },
      ],
      seed,
    })
    return result
  })
  const end = Date.now()

  const output = {
    matches: matchResults.length,
    ms: end - start,
  }

  return new Response(JSON.stringify(output, null, 2))
}
