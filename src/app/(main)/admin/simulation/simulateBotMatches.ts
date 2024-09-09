import { generateMatch } from '@/game/generateMatch'
import { flatten, range } from 'lodash-es'
import { BotGame } from './generateBotsWithItems'

export const simulateBotMatches = async ({
  bots,
  noOfRepeats,
}: {
  bots: BotGame[]
  noOfRepeats: number
}) => {
  const botResults = await Promise.all(
    bots.map(async (bot) => {
      const others = bots.filter((b) => b.name !== bot.name)

      await Promise.all(
        others.map(async (other) => {
          return await Promise.all(
            range(noOfRepeats).map(async (matchIdx) => {
              const matchReport = await generateMatch({
                participants: [
                  { loadout: bot.game.data.currentLoadout },
                  { loadout: other.game.data.currentLoadout },
                ],
                seed: [...bot.seed, 'match', matchIdx, other.name],
                skipLogs: true,
              })

              bot.matches += 1
              other.matches += 1
              bot.time += matchReport.time
              other.time += matchReport.time

              const isWinner = matchReport.winner.sideIdx === 0
              if (isWinner) {
                bot.wins += 1
              } else {
                other.wins += 1
              }

              const isDraw =
                matchReport.winner.stats.health ===
                matchReport.loser.stats.health
              if (isDraw) {
                bot.draws += 1
                other.draws += 1
              }

              return matchReport
            }),
          )
        }),
      ).then(flatten)

      return bot
    }),
  )
  return botResults
}
