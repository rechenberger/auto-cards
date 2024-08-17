import { orderBy, range, take, uniqBy } from 'lodash-es'
import { BotGame, generateBotsWithItems } from './generateBotsWithItems'
import { simulateBotMatches } from './simulateBotMatches'
import { SimulationInput } from './Simulation'

export type SimulationResult = Awaited<ReturnType<typeof simulate>>
export const simulate = async ({
  noOfBots,
  noOfRepeats,
  simulationSeed,
  startingGold,
  startingItems,
  noOfBotsSelected,
  noOfSelectionRounds,
}: SimulationInput) => {
  let bots: BotGame[] = []

  const startTime = Date.now()
  for (const selectionRound of range(noOfSelectionRounds + 1)) {
    const isFinal = selectionRound === noOfSelectionRounds

    if (!isFinal) {
      // console.time('generateBotsWithItems')
      let t = 0
      while (bots.length < noOfBots) {
        t++
        bots.push(
          ...(await generateBotsWithItems({
            noOfBots: noOfBots - bots.length,
            simulationSeed: [...simulationSeed, selectionRound, t],
            startingItems,
            startingGold,
          })),
        )
        bots = uniqBy(bots, (bot) =>
          orderBy(bot.game.data.currentLoadout.items, (i) => i.name)
            .map((i) => i.name)
            .join(','),
        )
      }
      // console.timeEnd('generateBotsWithItems')
    }

    // console.time('simulateBotMatches')
    await simulateBotMatches({
      bots,
      noOfRepeats,
    })
    // console.timeEnd('simulateBotMatches')

    bots = orderBy(bots, (bot) => bot.wins / bot.matches, ['desc'])

    if (!isFinal) {
      bots = take(bots, noOfBotsSelected)
      for (const bot of bots) {
        bot.wins = 0
        bot.draws = 0
        bot.matches = 0
        bot.time = 0
        bot.simulationRounds++
      }
    }
  }

  const tookSeconds = ((Date.now() - startTime) / 1000).toFixed(1)

  return {
    bots,
    tookSeconds,
  }
}
