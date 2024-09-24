// Ranking FROM: https://teampilot.ai/team/tristan/chat/fc29064dc7e58d739e6c5421322c11e3

import { first, orderBy } from 'lodash-es'

export const rankByScore = <T extends { score: number; rank: number }>({
  entries,
}: {
  entries: T[]
}) => {
  const results = orderBy(entries, (e) => e.score, 'desc')
  let rank = 1
  let prevScore = first(results)?.score ?? 0
  let nextRank = 1
  results.map((p, index) => {
    if (index > 0 && p.score === prevScore) {
      p.rank = rank
    } else {
      rank = nextRank
      p.rank = rank
    }
    prevScore = p.score
    nextRank++
  })

  return results
}
