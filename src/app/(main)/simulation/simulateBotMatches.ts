import { generateMatch } from '@/game/generateMatch'
import { flatten, range, sumBy } from 'lodash-es'
import { BotGame } from './generateBotsWithItems'

export const simulateBotMatches = async ({
  bots,
  noOfMatches,
}: {
  bots: BotGame[]
  noOfMatches: number
}) => {
  const botResults = await Promise.all(
    bots.map(async (bot) => {
      const others = bots.filter((b) => b.name !== bot.name)

      const matches = await Promise.all(
        others.map(async (other) => {
          return await Promise.all(
            range(noOfMatches).map(async (matchIdx) => {
              const matchReport = await generateMatch({
                participants: [
                  { loadout: bot.game.data.currentLoadout },
                  { loadout: other.game.data.currentLoadout },
                ],
                seed: [...bot.seed, 'match', matchIdx, other.name],
                skipLogs: true,
              })

              const isDraw =
                matchReport.winner.stats.health ===
                matchReport.loser.stats.health

              return { ...matchReport, isDraw }
            }),
          )
        }),
      ).then(flatten)

      const draws = sumBy(matches, (m) => (m.isDraw ? 1 : 0))
      const drawRate = draws / matches.length

      const wins = sumBy(matches, (m) => (m.winner.sideIdx === 0 ? 1 : 0))
      const winRate = wins / matches.length

      return {
        ...bot,
        wins,
        winRate,
        draws,
        drawRate,
      }
    }),
  )
  return botResults
}
