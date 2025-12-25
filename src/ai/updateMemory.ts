import { AiAgentMemory, AiAgentMemoryEntry } from '@/db/schema-zod'
import {
  getAiPlaytestLanguageModel,
  creativeOutputSettings,
} from '@/lib/aiGateway'
import { generateObject } from 'ai'
import { z } from 'zod'

/**
 * Maximum number of memory entries before we trigger summarization
 */
const MAX_MEMORY_ENTRIES = 20

/**
 * Schema for generated memory entries
 */
const MemoryUpdateSchema = z.object({
  newEntries: z.array(
    z.object({
      type: z.enum(['strategy', 'lesson', 'preference', 'meta']),
      content: z.string().max(200).describe('A concise insight or learning'),
      importance: z.number().min(0).max(1).describe('How important is this insight? 0-1'),
    }),
  ).max(3).describe('Up to 3 key takeaways from this run'),
})

/**
 * Schema for memory summarization
 */
const MemorySummarySchema = z.object({
  summary: z.string().max(500).describe('A concise summary of key learnings and strategies'),
  entriesToKeep: z.array(z.number()).describe('Indices of entries to keep (most valuable ones)'),
})

/**
 * Update agent memory after a run
 */
export async function updateMemoryAfterRun({
  memory,
  runSummary,
}: {
  memory: AiAgentMemory
  runSummary: {
    wins: number
    losses: number
    finalRound: number
    itemsBought: string[]
    strategySummary: string
  }
}): Promise<AiAgentMemory> {
  const model = getAiPlaytestLanguageModel()

  // Generate new memory entries from this run
  const prompt = `
You just completed a game of Auto Cards with the following results:

## Results
- Wins: ${runSummary.wins}
- Losses: ${runSummary.losses}
- Final Round: ${runSummary.finalRound + 1}
- Items Bought: ${runSummary.itemsBought.join(', ') || 'none'}

## Strategy Used
${runSummary.strategySummary}

## Your Previous Knowledge
${memory.summary || 'None yet - this is your first game!'}

Based on this experience, what key insights should you remember for future games?
Focus on:
- What worked well (strategy type)
- What didn't work (lesson type)
- What items/combinations you liked (preference type)
- Any meta observations about the game (meta type)
`

  const result = await generateObject({
    model,
    schema: MemoryUpdateSchema,
    prompt,
    ...creativeOutputSettings,
  })

  // Add new entries
  const timestamp = new Date().toISOString()
  const newEntries: AiAgentMemoryEntry[] = result.object.newEntries.map((e) => ({
    ...e,
    timestamp,
  }))

  const updatedMemory: AiAgentMemory = {
    ...memory,
    entries: [...memory.entries, ...newEntries],
    totalRuns: memory.totalRuns + 1,
    totalWins: memory.totalWins + runSummary.wins,
    totalLosses: memory.totalLosses + runSummary.losses,
  }

  // If we have too many entries, summarize and trim
  if (updatedMemory.entries.length > MAX_MEMORY_ENTRIES) {
    return await summarizeAndTrimMemory(updatedMemory)
  }

  return updatedMemory
}

/**
 * Summarize memory when it gets too long
 */
async function summarizeAndTrimMemory(
  memory: AiAgentMemory,
): Promise<AiAgentMemory> {
  const model = getAiPlaytestLanguageModel()

  const entriesText = memory.entries
    .map((e, i) => `[${i}] [${e.type}] (importance: ${e.importance}) ${e.content}`)
    .join('\n')

  const prompt = `
Your memory is getting full and needs to be consolidated.

## Current Stats
- Total Runs: ${memory.totalRuns}
- Total Wins: ${memory.totalWins}
- Total Losses: ${memory.totalLosses}
- Win Rate: ${memory.totalRuns > 0 ? ((memory.totalWins / memory.totalRuns) * 100).toFixed(1) : 0}%

## Previous Summary
${memory.summary || 'None'}

## All Memory Entries
${entriesText}

Please:
1. Create a new consolidated summary that captures all important learnings
2. Select which entries (by index) are most valuable to keep (max 10)
`

  const result = await generateObject({
    model,
    schema: MemorySummarySchema,
    prompt,
    ...creativeOutputSettings,
  })

  // Keep only the selected entries
  const keptEntries = result.object.entriesToKeep
    .filter((i) => i >= 0 && i < memory.entries.length)
    .slice(0, 10)
    .map((i) => memory.entries[i])

  return {
    ...memory,
    summary: result.object.summary,
    entries: keptEntries,
  }
}

/**
 * Initialize a new agent's memory
 */
export function createInitialMemory(): AiAgentMemory {
  return {
    entries: [],
    totalRuns: 0,
    totalWins: 0,
    totalLosses: 0,
  }
}

