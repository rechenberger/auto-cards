import { ItemName } from '@/game/allItems'
import { SeedArray } from '@/game/seed'
import { orderBy, range, take, throttle, uniqBy } from 'lodash-es'
import { BotGame, generateBotsWithItems } from './generateBotsWithItems'
import { simulateBotMatches } from './simulateBotMatches'

export type SimulationInput = {
  noOfBots: number
  noOfRepeats: number
  simulationSeed: SeedArray
  startingGold: number
  startingItems: ItemName[]
  noOfBotsSelected: number
  noOfSelectionRounds: number
}

export type SimulationResult = {
  bots: BotGame[]
  tookSeconds: string
  done: boolean
  selectionRound: number
}

export const simulate = async ({
  input,
  onUpdate = async () => {},
  onUpdateThrottleMs = 200,
}: {
  input: SimulationInput
  onUpdate?: (result: SimulationResult) => Promise<void>
  onUpdateThrottleMs?: number
}) => {
  const {
    noOfBots,
    noOfRepeats,
    simulationSeed,
    startingGold,
    startingItems,
    noOfBotsSelected,
    noOfSelectionRounds,
  } = input
  let bots: BotGame[] = []

  const startTime = Date.now()

  const onUpdateThrottled = throttle(onUpdate, onUpdateThrottleMs, {
    leading: true,
    trailing: true,
  })

  const update = async ({
    done,
    selectionRound,
  }: {
    done: boolean
    selectionRound: number
  }) => {
    const result = {
      bots,
      tookSeconds: ((Date.now() - startTime) / 1000).toFixed(1),
      done,
      selectionRound,
    }
    await onUpdateThrottled(result)
    return result
  }

  for (const selectionRound of range(noOfSelectionRounds + 1)) {
    const isFinal = selectionRound === noOfSelectionRounds

    if (!isFinal) {
      // console.time('generateBotsWithItems')
      let noOfTry = 0
      const maxTries = 10
      while (bots.length < noOfBots) {
        noOfTry++
        if (noOfTry > maxTries) {
          break
        }
        bots.push(
          ...(await generateBotsWithItems({
            noOfBots: noOfBots - bots.length,
            simulationSeed: [...simulationSeed, selectionRound, noOfTry],
            startingItems,
            startingGold,
          })),
        )
        bots = uniqBy(bots, (bot) =>
          orderBy(bot.game.data.currentLoadout.items, (i) => i.name)
            .map((i) => `${i.count ?? 1}:${i.name}`)
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

    const result = await update({ done: isFinal, selectionRound })
    if (isFinal) {
      return result
    }

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
}
