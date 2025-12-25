import { AiPlaytestStepAction, AiPlaytestStepObservation, AiAgentMemory } from '@/db/schema-zod'
import {
  getAiPlaytestLanguageModel,
  structuredOutputSettings,
} from '@/lib/aiGateway'
import { generateObject } from 'ai'
import { z } from 'zod'
import { formatObservationForPrompt } from './observeGame'

/**
 * Schema for the AI's decision response
 */
const DecisionSchema = z.object({
  action: z.discriminatedUnion('type', [
    z.object({
      type: z.literal('buy'),
      shopIndex: z.number().describe('Index of the item in the shop to buy'),
      reasoning: z.string().describe('Brief explanation of why you chose this action'),
    }),
    z.object({
      type: z.literal('reserve'),
      shopIndex: z.number().describe('Index of the item in the shop to reserve'),
      reasoning: z.string().describe('Brief explanation of why you chose this action'),
    }),
    z.object({
      type: z.literal('unreserve'),
      shopIndex: z.number().describe('Index of the reserved item to unreserve'),
      reasoning: z.string().describe('Brief explanation of why you chose this action'),
    }),
    z.object({
      type: z.literal('reroll'),
      reasoning: z.string().describe('Brief explanation of why you chose this action'),
    }),
    z.object({
      type: z.literal('endShop'),
      reasoning: z.string().describe('Brief explanation of why you chose this action'),
    }),
  ]),
})

type Decision = z.infer<typeof DecisionSchema>

/**
 * Build the system prompt for the AI agent
 */
function buildSystemPrompt(memory: AiAgentMemory): string {
  const lines: string[] = []

  lines.push(`You are an AI player for Auto Cards, an auto-battler card game.`)
  lines.push('')
  lines.push(`## Game Rules`)
  lines.push(`- Each round, you start in a shop where you can buy items with gold`)
  lines.push(`- Items add stats and abilities to your loadout`)
  lines.push(`- After shopping, you fight against an opponent automatically`)
  lines.push(`- Win fights to progress through rounds`)
  lines.push(`- Unique items can only be held once`)
  lines.push(`- Some items have tags that create synergies`)
  lines.push('')
  lines.push(`## Available Actions`)
  lines.push(`1. **buy**: Purchase an item from the shop (costs gold)`)
  lines.push(`2. **reserve**: Lock an item so it stays after reroll (free)`)
  lines.push(`3. **unreserve**: Unlock a reserved item (free)`)
  lines.push(`4. **reroll**: Get new shop items (costs 1 gold)`)
  lines.push(`5. **endShop**: Finish shopping and start the fight`)
  lines.push('')
  lines.push(`## Strategy Tips`)
  lines.push(`- Build synergies with items that share tags (e.g., weapons, food)`)
  lines.push(`- Balance offense (damage) and defense (health/healing)`)
  lines.push(`- Buy sale items when they fit your strategy`)
  lines.push(`- Don't reroll too much - gold is precious`)
  lines.push(`- End shop when you can't afford useful items`)

  // Add memory if available
  if (memory.summary) {
    lines.push('')
    lines.push(`## Your Learning (from previous games)`)
    lines.push(memory.summary)
  }

  if (memory.entries.length > 0) {
    lines.push('')
    lines.push(`## Recent Insights`)
    // Show top 5 most important recent entries
    const recentImportant = [...memory.entries]
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 5)
    for (const entry of recentImportant) {
      lines.push(`- [${entry.type}] ${entry.content}`)
    }
  }

  return lines.join('\n')
}

/**
 * Decide the next action for the AI agent
 */
export async function decideNextAction({
  observation,
  memory,
  invalidActionError,
}: {
  observation: AiPlaytestStepObservation
  memory: AiAgentMemory
  /** If the previous action was invalid, include the error message */
  invalidActionError?: string
}): Promise<AiPlaytestStepAction> {
  const model = getAiPlaytestLanguageModel()
  const systemPrompt = buildSystemPrompt(memory)
  const gameState = formatObservationForPrompt(observation)

  let userPrompt = `Here is the current game state:\n\n${gameState}\n\nWhat action do you want to take?`

  if (invalidActionError) {
    userPrompt += `\n\n⚠️ Your previous action was invalid: ${invalidActionError}\nPlease choose a valid action.`
  }

  const result = await generateObject({
    model,
    schema: DecisionSchema,
    system: systemPrompt,
    prompt: userPrompt,
    ...structuredOutputSettings,
  })

  return result.object.action
}

/**
 * Validate that an action is legal given the current observation
 */
export function validateAction(
  action: AiPlaytestStepAction,
  observation: AiPlaytestStepObservation,
): { valid: boolean; error?: string } {
  switch (action.type) {
    case 'buy': {
      const item = observation.shopItems[action.shopIndex]
      if (!item) {
        return { valid: false, error: `Shop index ${action.shopIndex} does not exist` }
      }
      if (item.isSold) {
        return { valid: false, error: `Item at index ${action.shopIndex} is already sold` }
      }
      if (item.effectivePrice > observation.gold) {
        return {
          valid: false,
          error: `Not enough gold. Item costs ${item.effectivePrice}, you have ${observation.gold}`,
        }
      }
      // Check unique constraint
      if (item.isUnique) {
        const alreadyOwned = observation.currentLoadout.items.some(
          (i) => i.name === item.name,
        )
        if (alreadyOwned) {
          return { valid: false, error: `You already own the unique item "${item.name}"` }
        }
      }
      return { valid: true }
    }

    case 'reserve':
    case 'unreserve': {
      const item = observation.shopItems[action.shopIndex]
      if (!item) {
        return { valid: false, error: `Shop index ${action.shopIndex} does not exist` }
      }
      if (item.isSold) {
        return { valid: false, error: `Cannot reserve/unreserve a sold item` }
      }
      if (action.type === 'reserve' && item.isReserved) {
        return { valid: false, error: `Item is already reserved` }
      }
      if (action.type === 'unreserve' && !item.isReserved) {
        return { valid: false, error: `Item is not reserved` }
      }
      return { valid: true }
    }

    case 'reroll': {
      if (observation.gold < observation.rerollPrice) {
        return {
          valid: false,
          error: `Not enough gold to reroll. Costs ${observation.rerollPrice}, you have ${observation.gold}`,
        }
      }
      return { valid: true }
    }

    case 'endShop': {
      return { valid: true }
    }

    default:
      return { valid: false, error: 'Unknown action type' }
  }
}

/**
 * Format an action as a human-readable string
 */
export function formatAction(action: AiPlaytestStepAction): string {
  switch (action.type) {
    case 'buy':
      return `Buy item at index ${action.shopIndex}`
    case 'reserve':
      return `Reserve item at index ${action.shopIndex}`
    case 'unreserve':
      return `Unreserve item at index ${action.shopIndex}`
    case 'reroll':
      return `Reroll shop`
    case 'endShop':
      return `End shopping phase`
    default:
      return `Unknown action`
  }
}

