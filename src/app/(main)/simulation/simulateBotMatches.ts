import { range } from 'lodash-es'
import Piscina from 'piscina'
import { BotGame } from './generateBotsWithItems'

let piscina: Piscina | null = null

function getPiscina() {
  if (!piscina) {
    piscina = new Piscina({
      filename: new URL('./matchWorker.ts', import.meta.url).href,
      maxThreads: 4, // Adjust based on your needs
    })
  }
  return piscina
}

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

      const matchResults = await Promise.all(
        others.flatMap((other) =>
          range(noOfRepeats).map(async (matchIdx) => {
            const matchReport: any = await getPiscina().run({
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
              matchReport.winner.stats.health === matchReport.loser.stats.health
            if (isDraw) {
              bot.draws += 1
              other.draws += 1
            }

            return matchReport
          }),
        ),
      )

      return bot
    }),
  )
  return botResults
}
