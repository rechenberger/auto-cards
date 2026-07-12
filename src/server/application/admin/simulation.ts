import { SimulationInputDto, SimulationResultDto } from '@/contracts/admin'
import { Game } from '@/db/schema-zod'
import { getAllItems } from '@/game/allItems'
import type { ItemName } from '@/game/allItems'
import { countifyItems } from '@/game/countifyItems'
import { GAME_VERSION } from '@/game/config'
import { DefaultGameMode } from '@/game/gameMode'
import { generateMatch } from '@/game/generateMatch'
import { orderItems } from '@/game/orderItems'
import { rngItem, seedToString } from '@/game/seed'
import { typedParse } from '@/lib/typedParse'
import { orderBy, range, take, uniqBy } from 'lodash-es'

type InternalBot = {
  name: string
  seed: (string | number | object)[]
  wins: number
  matches: number
  draws: number
  time: number
  simulationRounds: number
  game: Game
}

const generateBots = async ({
  noOfBots,
  simulationSeed,
  startingGold,
  startingItems,
}: Pick<
  SimulationInputDto,
  'noOfBots' | 'simulationSeed' | 'startingGold' | 'startingItems'
>): Promise<InternalBot[]> => {
  const definitions = getAllItems(GAME_VERSION)
  return Promise.all(
    range(noOfBots).map(async (idx) => {
      const name = `Bot ${idx}`
      const seed = [...simulationSeed, 'bot', idx]
      const game = typedParse(Game, {
        id: `simulation-${name}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: 'simulation',
        data: {
          currentLoadout: {
            items: startingItems.map((itemName) => ({ name: itemName })),
          },
          gold: startingGold,
          roundNo: 0,
          seed: seedToString({ seed: [...seed, 'game'] }),
          shopItems: [],
          shopRerolls: 0,
          version: GAME_VERSION,
        },
        liveMatchId: null,
        version: GAME_VERSION,
        gameMode: DefaultGameMode,
        revision: 0,
      })

      while (game.data.gold > 0) {
        const buyable = definitions.filter((item) => {
          if (!item.price || item.price > game.data.gold) return false
          return !(
            item.unique &&
            game.data.currentLoadout.items.some(
              (candidate) => candidate.name === item.name,
            )
          )
        })
        if (!buyable.length) break
        const item = rngItem({
          seed: [seed, 'buy', game.data.gold],
          items: buyable,
        })
        game.data.gold -= item.price
        game.data.currentLoadout.items.push({ name: item.name })
      }

      game.data.currentLoadout.items = orderItems(
        countifyItems(game.data.currentLoadout.items),
        GAME_VERSION,
      )

      return {
        name,
        seed,
        wins: 0,
        matches: 0,
        draws: 0,
        time: 0,
        simulationRounds: 0,
        game,
      }
    }),
  )
}

const simulateBotMatches = async ({
  bots,
  noOfRepeats,
}: {
  bots: InternalBot[]
  noOfRepeats: number
}) => {
  const allItems = getAllItems(GAME_VERSION)
  await Promise.all(
    bots.flatMap((bot) =>
      bots
        .filter((other) => other !== bot)
        .flatMap((other) =>
          range(noOfRepeats).map(async (matchIdx) => {
            const matchReport = await generateMatch({
              participants: [
                { loadout: bot.game.data.currentLoadout },
                { loadout: other.game.data.currentLoadout },
              ],
              seed: [...bot.seed, 'match', matchIdx, other.seed],
              skipLogs: true,
              rulesetVersion: GAME_VERSION,
              allItems,
            })

            bot.matches += 1
            other.matches += 1
            bot.time += matchReport.time
            other.time += matchReport.time

            if (matchReport.winner.sideIdx === 0) bot.wins += 1
            else other.wins += 1

            if (
              matchReport.winner.stats.health === matchReport.loser.stats.health
            ) {
              bot.draws += 1
              other.draws += 1
            }
          }),
        ),
    ),
  )
}

const loadoutKey = (bot: InternalBot) =>
  orderBy(bot.game.data.currentLoadout.items, (item) => item.name)
    .map((item) => `${item.count ?? 1}:${item.name}`)
    .join(',')

export const runSimulation = async (
  rawInput: SimulationInputDto,
): Promise<SimulationResultDto> => {
  const input = SimulationInputDto.parse(rawInput)
  const startedAt = Date.now()
  let bots: InternalBot[] = []

  for (const selectionRound of range(input.noOfSelectionRounds + 1)) {
    const isFinal = selectionRound === input.noOfSelectionRounds
    if (!isFinal) {
      let attempt = 0
      while (bots.length < input.noOfBots && attempt < 10) {
        attempt += 1
        bots.push(
          ...(await generateBots({
            noOfBots: input.noOfBots - bots.length,
            simulationSeed: [...input.simulationSeed, selectionRound, attempt],
            startingItems: input.startingItems as ItemName[],
            startingGold: input.startingGold,
          })),
        )
        bots = uniqBy(bots, loadoutKey)
      }
    }

    await simulateBotMatches({ bots, noOfRepeats: input.noOfRepeats })
    bots = orderBy(bots, (bot) => (bot.matches ? bot.wins / bot.matches : 0), [
      'desc',
    ])

    if (isFinal) {
      return SimulationResultDto.parse({
        bots: bots.map((bot) => ({
          name: bot.name,
          wins: bot.wins,
          matches: bot.matches,
          draws: bot.draws,
          time: bot.time,
          simulationRounds: bot.simulationRounds,
          loadout: bot.game.data.currentLoadout,
        })),
        tookSeconds: ((Date.now() - startedAt) / 1_000).toFixed(1),
        done: true,
        selectionRound,
      })
    }

    bots = take(bots, input.noOfBotsSelected)
    for (const bot of bots) {
      bot.wins = 0
      bot.draws = 0
      bot.matches = 0
      bot.time = 0
      bot.simulationRounds += 1
    }
  }

  throw new Error('Simulation did not produce a result')
}
