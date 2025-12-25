import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { AiPlaytestRun, AiPlaytestStep } from '@/db/schema-zod'
import {
  getAiPlaytestLanguageModel,
  creativeOutputSettings,
} from '@/lib/aiGateway'
import { generateText } from 'ai'
import { eq } from 'drizzle-orm'

/**
 * Generate an experience report for a completed run
 */
export async function generateExperienceReport({
  run,
  steps,
}: {
  run: AiPlaytestRun
  steps: AiPlaytestStep[]
}): Promise<string> {
  const model = getAiPlaytestLanguageModel()

  // Build context from steps
  const roundSummaries: string[] = []
  let currentRound = -1
  let roundActions: string[] = []

  for (const step of steps) {
    if (step.roundNo !== currentRound) {
      if (currentRound >= 0) {
        roundSummaries.push(
          `### Round ${currentRound + 1}\n${roundActions.join('\n')}`,
        )
      }
      currentRound = step.roundNo
      roundActions = []
    }

    const actionDesc = describeAction(step)
    roundActions.push(`- ${actionDesc}`)
  }

  // Add last round
  if (roundActions.length > 0) {
    roundSummaries.push(
      `### Round ${currentRound + 1}\n${roundActions.join('\n')}`,
    )
  }

  const prompt = `
You are an AI game tester who just completed a playtest of Auto Cards.

## Run Results
- Total Wins: ${run.wins}
- Total Losses: ${run.losses}
- Final Round: ${(run.finalRound ?? 0) + 1}
- Model: ${run.model}

## Actions Taken
${roundSummaries.join('\n\n')}

Please write a brief experience report covering:
1. **Overall Experience**: How did the game feel? Was it engaging?
2. **Decision Making**: What strategies did you try? Which worked best?
3. **Pain Points**: Any frustrating moments or confusing mechanics?
4. **Balance Observations**: Did any items feel too strong/weak?
5. **Memorable Moments**: Any interesting or surprising situations?

Keep the report concise but insightful (300-500 words).
`

  const result = await generateText({
    model,
    prompt,
    ...creativeOutputSettings,
  })

  return result.text
}

/**
 * Generate content/balance suggestions based on a run
 */
export async function generateSuggestions({
  run,
  steps,
}: {
  run: AiPlaytestRun
  steps: AiPlaytestStep[]
}): Promise<string> {
  const model = getAiPlaytestLanguageModel()

  // Analyze item usage patterns
  const itemsBought: Record<string, number> = {}
  const itemsIgnored: Record<string, number> = {}

  for (const step of steps) {
    if (step.action.type === 'buy') {
      const item = step.observation.shopItems[step.action.shopIndex]
      if (item) {
        itemsBought[item.name] = (itemsBought[item.name] || 0) + 1
      }
    }

    // Track items that were available but not bought
    for (const item of step.observation.shopItems) {
      if (!item.isSold) {
        itemsIgnored[item.name] = (itemsIgnored[item.name] || 0) + 1
      }
    }
  }

  const topBought = Object.entries(itemsBought)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => `${name}: bought ${count}x`)
    .join('\n')

  const topIgnored = Object.entries(itemsIgnored)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => `${name}: ignored ${count}x`)
    .join('\n')

  const prompt = `
You are a game designer analyzing playtest data from Auto Cards.

## Run Stats
- Wins: ${run.wins}, Losses: ${run.losses}
- Win Rate: ${run.wins + run.losses > 0 ? ((run.wins / (run.wins + run.losses)) * 100).toFixed(1) : 0}%

## Item Usage
### Most Purchased
${topBought || 'No items purchased'}

### Most Ignored (available but not bought)
${topIgnored || 'N/A'}

Based on this playtest data, please suggest:

1. **Balance Adjustments** (2-3 suggestions)
   - Items that might need price/stat changes
   - Format: "Item Name: suggestion (reason)"

2. **New Item Ideas** (2-3 ideas)
   - Items that would fill gaps in the current meta
   - Format: "Item Name (tags): description, suggested stats"

3. **Mechanic Improvements** (1-2 ideas)
   - Shop/combat/progression changes

Keep suggestions specific and actionable. Focus on improving player experience and strategic depth.
`

  const result = await generateText({
    model,
    prompt,
    ...creativeOutputSettings,
  })

  return result.text
}

/**
 * Generate and save reports for a completed run
 */
export async function generateAndSaveReports({
  runId,
}: {
  runId: string
}): Promise<{ summary: string; suggestions: string }> {
  // Load run and steps
  const run = await db.query.aiPlaytestRun.findFirst({
    where: eq(schema.aiPlaytestRun.id, runId),
  })

  if (!run) {
    throw new Error('Run not found')
  }

  const steps = await db.query.aiPlaytestStep.findMany({
    where: eq(schema.aiPlaytestStep.runId, runId),
    orderBy: (s, { asc }) => [asc(s.roundNo), asc(s.stepNo)],
  })

  // Parse steps with zod
  const parsedSteps = steps.map((s) => AiPlaytestStep.parse(s))
  const parsedRun = AiPlaytestRun.parse(run)

  // Generate reports
  const [summary, suggestions] = await Promise.all([
    generateExperienceReport({ run: parsedRun, steps: parsedSteps }),
    generateSuggestions({ run: parsedRun, steps: parsedSteps }),
  ])

  // Save to run
  await db
    .update(schema.aiPlaytestRun)
    .set({
      summaryMarkdown: summary,
      suggestionsMarkdown: suggestions,
    })
    .where(eq(schema.aiPlaytestRun.id, runId))

  return { summary, suggestions }
}

/**
 * Describe an action in human-readable form
 */
function describeAction(step: AiPlaytestStep): string {
  const action = step.action
  const result = step.result

  let desc = ''

  switch (action.type) {
    case 'buy': {
      const item = step.observation.shopItems[action.shopIndex]
      desc = `Bought ${item?.name ?? 'unknown'} for ${item?.effectivePrice ?? '?'} gold`
      break
    }
    case 'reserve': {
      const item = step.observation.shopItems[action.shopIndex]
      desc = `Reserved ${item?.name ?? 'unknown'}`
      break
    }
    case 'unreserve': {
      const item = step.observation.shopItems[action.shopIndex]
      desc = `Unreserved ${item?.name ?? 'unknown'}`
      break
    }
    case 'reroll':
      desc = `Rerolled shop`
      break
    case 'endShop':
      desc = `Ended shopping`
      break
    default:
      desc = `Unknown action`
  }

  if (!result.success && result.error) {
    desc += ` (FAILED: ${result.error})`
  }

  if (action.reasoning) {
    desc += ` — "${action.reasoning}"`
  }

  return desc
}

