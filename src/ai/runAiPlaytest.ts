import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import {
  AiAgent,
  AiPlaytestRunConfig,
  AiPlaytestStepAction,
  AiPlaytestStepObservation,
  AiPlaytestStepResult,
  Game,
} from '@/db/schema-zod'
import { getItemByName, ItemName } from '@/game/allItems'
import { calcStats, hasNegativeStats } from '@/game/calcStats'
import { GAME_VERSION, NO_OF_ROUNDS } from '@/game/config'
import { countifyItems } from '@/game/countifyItems'
import { DefaultGameMode } from '@/game/gameMode'
import { generateMatch } from '@/game/generateMatch'
import { generateShopItems } from '@/game/generateShopItems'
import { roundStats } from '@/game/roundStats'
import { createSeed, rngItem, SeedArray, seedToString } from '@/game/seed'
import { getAiPlaytestModel } from '@/lib/aiGateway'
import { typedParse } from '@/lib/typedParse'
import { and, desc, eq, isNull, or } from 'drizzle-orm'
import { cloneDeep, first } from 'lodash-es'
import { decideNextAction, formatAction, validateAction } from './decideNextAction'
import { observeGame } from './observeGame'
import { updateMemoryAfterRun } from './updateMemory'

export type AiPlaytestProgress = {
  roundNo: number
  stepNo: number
  gold: number
  itemCount: number
  wins: number
  losses: number
  lastAction?: string
  status: 'shopping' | 'fighting' | 'advancing' | 'completed' | 'failed'
  error?: string
}

export type AiPlaytestCallbacks = {
  onProgress?: (progress: AiPlaytestProgress) => void
  onStep?: (step: {
    roundNo: number
    stepNo: number
    observation: AiPlaytestStepObservation
    action: AiPlaytestStepAction
    result: AiPlaytestStepResult
  }) => void
}

/**
 * Run an AI playtest - the agent plays through a full game in sandbox mode
 */
export async function runAiPlaytest({
  agent,
  config,
  seed,
  callbacks,
}: {
  agent: AiAgent
  config: AiPlaytestRunConfig
  seed?: string
  callbacks?: AiPlaytestCallbacks
}): Promise<{
  runId: string
  wins: number
  losses: number
  finalRound: number
  itemsBought: string[]
  error?: string
}> {
  const runSeed = seed || createSeed()
  const model = getAiPlaytestModel()

  // Create run record
  const run = await db
    .insert(schema.aiPlaytestRun)
    .values({
      aiAgentId: agent.id,
      config,
      model,
      seed: runSeed,
      status: 'running',
    })
    .returning()
    .then(first)

  if (!run) {
    throw new Error('Failed to create AI playtest run')
  }

  let wins = 0
  let losses = 0
  const itemsBought: string[] = []
  const recentActions: string[] = []

  try {
    // Initialize in-memory game (not saved to DB)
    const game = await createSandboxGame({ seed: runSeed })

    const maxRounds = Math.min(config.maxRounds, NO_OF_ROUNDS)

    // Main game loop
    for (let roundNo = 0; roundNo < maxRounds; roundNo++) {
      game.data.roundNo = roundNo

      // Generate shop for this round (except first round which already has shop)
      if (roundNo > 0) {
        await advanceRound(game)
      }

      // Shopping phase
      let stepNo = 0
      let shopComplete = false

      while (!shopComplete && stepNo < config.maxShopStepsPerRound) {
        callbacks?.onProgress?.({
          roundNo,
          stepNo,
          gold: game.data.gold,
          itemCount: game.data.currentLoadout.items.length,
          wins,
          losses,
          status: 'shopping',
        })

        // Build observation
        const observation = await observeGame({
          game,
          recentActions,
          wins,
          losses,
        })

        // Get AI decision with retries for invalid actions
        let action: AiPlaytestStepAction | null = null
        let invalidError: string | undefined

        for (let retry = 0; retry <= config.maxActionRetries; retry++) {
          try {
            action = await decideNextAction({
              observation,
              memory: agent.memory,
              invalidActionError: invalidError,
            })

            const validation = validateAction(action, observation)
            if (!validation.valid) {
              invalidError = validation.error
              action = null
              continue
            }

            break
          } catch (err) {
            invalidError = err instanceof Error ? err.message : 'Unknown error'
          }
        }

        // If we couldn't get a valid action after retries, force end shop
        if (!action) {
          action = { type: 'endShop', reasoning: 'Forced end after invalid actions' }
        }

        // Apply the action
        const result = await applyAction(game, action, observation)

        // Track bought items
        if (action.type === 'buy' && result.success) {
          const item = observation.shopItems[action.shopIndex]
          if (item) {
            itemsBought.push(item.name)
          }
        }

        // Record action for context
        recentActions.push(formatAction(action))
        if (recentActions.length > 10) {
          recentActions.shift()
        }

        // Save step to DB
        await db.insert(schema.aiPlaytestStep).values({
          runId: run.id,
          roundNo,
          stepNo,
          observation,
          action,
          result,
        })

        callbacks?.onStep?.({
          roundNo,
          stepNo,
          observation,
          action,
          result,
        })

        callbacks?.onProgress?.({
          roundNo,
          stepNo,
          gold: game.data.gold,
          itemCount: game.data.currentLoadout.items.length,
          wins,
          losses,
          lastAction: formatAction(action),
          status: 'shopping',
        })

        stepNo++

        if (action.type === 'endShop') {
          shopComplete = true
        }
      }

      // Fight phase
      callbacks?.onProgress?.({
        roundNo,
        stepNo,
        gold: game.data.gold,
        itemCount: game.data.currentLoadout.items.length,
        wins,
        losses,
        status: 'fighting',
      })

      const fightResult = await simulateFight(game, runSeed)
      if (fightResult.won) {
        wins++
      } else {
        losses++
      }

      recentActions.push(
        fightResult.won ? '✅ Won fight!' : '❌ Lost fight',
      )

      callbacks?.onProgress?.({
        roundNo,
        stepNo,
        gold: game.data.gold,
        itemCount: game.data.currentLoadout.items.length,
        wins,
        losses,
        status: 'advancing',
      })
    }

    // Update run with results
    await db
      .update(schema.aiPlaytestRun)
      .set({
        status: 'completed',
        wins,
        losses,
        finalRound: maxRounds - 1,
      })
      .where(eq(schema.aiPlaytestRun.id, run.id))

    // Update agent memory if configured
    if (config.updateMemory) {
      const updatedMemory = await updateMemoryAfterRun({
        memory: agent.memory,
        runSummary: {
          wins,
          losses,
          finalRound: maxRounds - 1,
          itemsBought,
          strategySummary: summarizeStrategy(itemsBought, wins, losses),
        },
      })

      await db
        .update(schema.aiAgent)
        .set({ memory: updatedMemory })
        .where(eq(schema.aiAgent.id, agent.id))
    }

    callbacks?.onProgress?.({
      roundNo: maxRounds - 1,
      stepNo: 0,
      gold: 0,
      itemCount: 0,
      wins,
      losses,
      status: 'completed',
    })

    return {
      runId: run.id,
      wins,
      losses,
      finalRound: maxRounds - 1,
      itemsBought,
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'

    await db
      .update(schema.aiPlaytestRun)
      .set({
        status: 'failed',
        errorMessage,
        wins,
        losses,
      })
      .where(eq(schema.aiPlaytestRun.id, run.id))

    callbacks?.onProgress?.({
      roundNo: 0,
      stepNo: 0,
      gold: 0,
      itemCount: 0,
      wins,
      losses,
      status: 'failed',
      error: errorMessage,
    })

    return {
      runId: run.id,
      wins,
      losses,
      finalRound: 0,
      itemsBought,
      error: errorMessage,
    }
  }
}

/**
 * Create a sandbox game state (not persisted)
 */
async function createSandboxGame({ seed }: { seed: string }): Promise<Game> {
  const game = typedParse(Game, {
    id: `sandbox-${seed}`,
    userId: 'ai-sandbox',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    data: {
      version: GAME_VERSION,
      gold: first(roundStats)?.gold ?? 0,
      seed,
      shopItems: [],
      currentLoadout: {
        items: [{ name: 'hero' }],
      },
    },
    liveMatchId: null,
    version: GAME_VERSION,
    gameMode: DefaultGameMode,
  })

  game.data.shopItems = await generateShopItems({ game })

  return game
}

/**
 * Advance to the next round (same logic as NextRoundButton)
 */
async function advanceRound(game: Game): Promise<void> {
  game.data.roundNo += 1
  game.data.shopRerolls = 0
  game.data.gold += roundStats[game.data.roundNo]?.gold ?? 0

  // Handle onShopEntered triggers
  const resolvedItems = await Promise.all(
    game.data.currentLoadout.items.map(async (i) => {
      const resolvedItem = await getItemByName(i.name)
      return { ...resolvedItem, count: i.count }
    }),
  )

  const onShopEnteredItems = resolvedItems.filter((i) => {
    return i?.triggers?.some((t) => t.type === 'onShopEntered')
  })

  for (const item of onShopEnteredItems) {
    const resolvedItem = await getItemByName(item.name)
    const triggers = resolvedItem.triggers?.filter(
      (t) => t.type === 'onShopEntered',
    )
    if (triggers) {
      for (const t of triggers) {
        if (t.statsSelf?.gold) {
          game.data.gold += t.statsSelf.gold * (item.count ?? 1)
        }
      }
    }
  }

  // Add experience
  const experience = roundStats[game.data.roundNo]?.experience ?? 0
  const expItem = game.data.currentLoadout.items.find(
    (i) => i.name === ('experience' satisfies ItemName),
  )
  if (expItem) {
    expItem.count = (expItem.count ?? 0) + experience
  } else if (experience > 0) {
    game.data.currentLoadout.items.push({
      name: 'experience' satisfies ItemName,
      count: experience,
    })
  }

  // Generate new shop
  game.data.shopItems = await generateShopItems({ game })
}

/**
 * Apply an action to the game state
 */
async function applyAction(
  game: Game,
  action: AiPlaytestStepAction,
  observation: AiPlaytestStepObservation,
): Promise<AiPlaytestStepResult> {
  switch (action.type) {
    case 'buy': {
      const shopItem = game.data.shopItems[action.shopIndex]
      const obsItem = observation.shopItems[action.shopIndex]

      if (!shopItem || !obsItem) {
        return { success: false, error: 'Invalid shop index' }
      }

      if (shopItem.isSold) {
        return { success: false, error: 'Item already sold' }
      }

      const item = await getItemByName(shopItem.name)
      const price = obsItem.effectivePrice

      if (game.data.gold < price) {
        return { success: false, error: 'Not enough gold' }
      }

      // Check unique constraint
      if (item.unique) {
        const alreadyOwned = game.data.currentLoadout.items.some(
          (i) => i.name === shopItem.name,
        )
        if (alreadyOwned) {
          return { success: false, error: 'Already own unique item' }
        }
      }

      // Check for negative stats
      const newLoadout = {
        ...game.data.currentLoadout,
        items: [
          ...game.data.currentLoadout.items,
          { name: shopItem.name, aspects: shopItem.aspects },
        ],
      }
      const stats = await calcStats({ loadout: newLoadout })
      if (hasNegativeStats({ stats })) {
        return { success: false, error: 'Would cause negative stats' }
      }

      // Apply purchase
      game.data.gold -= price
      shopItem.isSold = true
      shopItem.isReserved = false
      game.data.currentLoadout.items = countifyItems([
        ...game.data.currentLoadout.items,
        { name: shopItem.name, aspects: shopItem.aspects },
      ])

      return {
        success: true,
        goldChange: -price,
        itemsBought: [shopItem.name],
      }
    }

    case 'reserve': {
      const shopItem = game.data.shopItems[action.shopIndex]
      if (!shopItem) {
        return { success: false, error: 'Invalid shop index' }
      }
      if (shopItem.isSold) {
        return { success: false, error: 'Cannot reserve sold item' }
      }
      shopItem.isReserved = true
      return { success: true }
    }

    case 'unreserve': {
      const shopItem = game.data.shopItems[action.shopIndex]
      if (!shopItem) {
        return { success: false, error: 'Invalid shop index' }
      }
      shopItem.isReserved = false
      return { success: true }
    }

    case 'reroll': {
      const rerollPrice = 1
      if (game.data.gold < rerollPrice) {
        return { success: false, error: 'Not enough gold to reroll' }
      }
      game.data.gold -= rerollPrice
      game.data.shopRerolls += 1
      game.data.shopItems = await generateShopItems({ game })
      return { success: true, goldChange: -rerollPrice }
    }

    case 'endShop': {
      return { success: true }
    }

    default:
      return { success: false, error: 'Unknown action type' }
  }
}

/**
 * Simulate a fight against a DB loadout (sandbox - no persistence)
 */
async function simulateFight(
  game: Game,
  runSeed: string,
): Promise<{ won: boolean; enemyLoadoutSummary: string }> {
  // Find enemy loadouts from DB (same logic as fight.ts)
  const enemyLoadouts = await db.query.loadout.findMany({
    where: and(
      eq(schema.loadout.roundNo, game.data.roundNo),
      or(
        // Don't filter by userId since this is sandbox
        isNull(schema.loadout.userId),
      ),
      eq(schema.loadout.version, GAME_VERSION),
    ),
    limit: 20,
    orderBy: desc(schema.loadout.createdAt),
  })

  // If no bot loadouts, try to find any loadout for this round
  let enemyLoadout = rngItem({
    items: enemyLoadouts,
    seed: [runSeed, 'round', game.data.roundNo, 'enemy'] as SeedArray,
  })

  if (!enemyLoadout) {
    // Fallback: get any loadout from this round
    const fallbackLoadouts = await db.query.loadout.findMany({
      where: and(
        eq(schema.loadout.roundNo, game.data.roundNo),
        eq(schema.loadout.version, GAME_VERSION),
      ),
      limit: 20,
      orderBy: desc(schema.loadout.createdAt),
    })

    enemyLoadout = rngItem({
      items: fallbackLoadouts,
      seed: [runSeed, 'round', game.data.roundNo, 'enemy', 'fallback'] as SeedArray,
    })
  }

  if (!enemyLoadout) {
    // If still no loadout, create a simple bot loadout
    return {
      won: true, // Auto-win if no opponent
      enemyLoadoutSummary: 'No opponent found',
    }
  }

  // Run the match simulation
  const matchSeed = seedToString({
    seed: [runSeed, game.data.roundNo, 'match'] as SeedArray,
  })

  const matchReport = generateMatch({
    participants: [
      { loadout: cloneDeep(game.data.currentLoadout) },
      { loadout: enemyLoadout.data },
    ],
    seed: [matchSeed],
    skipLogs: true,
  })

  const won = matchReport.winner.sideIdx === 0
  const enemyItems = enemyLoadout.data.items.map((i) => i.name).join(', ')

  return {
    won,
    enemyLoadoutSummary: `Items: ${enemyItems}`,
  }
}

/**
 * Summarize the strategy used in a run
 */
function summarizeStrategy(
  itemsBought: string[],
  wins: number,
  losses: number,
): string {
  const itemCounts: Record<string, number> = {}
  for (const item of itemsBought) {
    itemCounts[item] = (itemCounts[item] || 0) + 1
  }

  const topItems = Object.entries(itemCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => `${name} x${count}`)
    .join(', ')

  const winRate = wins + losses > 0 ? ((wins / (wins + losses)) * 100).toFixed(0) : '0'

  return `Win rate: ${winRate}%. Top items: ${topItems || 'none'}`
}

