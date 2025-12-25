import { throwIfNotAdmin } from '@/auth/getIsAdmin'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { AiAgent, AiPlaytestRunConfig } from '@/db/schema-zod'
import { createInitialMemory, generateAndSaveReports, runAiPlaytest } from '@/ai'
import { createStreamableUI } from '@/lib/streamableUI'
import {
  streamDialog,
  streamToast,
  superAction,
} from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { desc, eq } from 'drizzle-orm'
import { Bot, FileText, Play, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { Metadata } from 'next'
import { revalidatePath } from 'next/cache'
import { Fragment } from 'react'
import { AiPlaytestProgressDisplay } from './AiPlaytestProgressDisplay'
import { AiPlaytestRunCard } from './AiPlaytestRunCard'

export const metadata: Metadata = {
  title: 'AI Playtest',
}

export default async function Page() {
  await throwIfNotAdmin({ allowDev: true })

  // Load agents
  const agents = await db.query.aiAgent.findMany({
    orderBy: desc(schema.aiAgent.createdAt),
  })

  // Load recent runs
  const runs = await db.query.aiPlaytestRun.findMany({
    orderBy: desc(schema.aiPlaytestRun.createdAt),
    limit: 20,
    with: {
      agent: true,
    },
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">AI Playtest</h1>
        <p className="text-muted-foreground">
          Let AI agents play the game, learn from experience, and suggest improvements.
        </p>
      </div>

      {/* Agents Section */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-row items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Bot className="size-5" />
            AI Agents
          </h2>
          <ActionButton
            variant="outline"
            size="sm"
            action={async () => {
              'use server'
              return superAction(async () => {
                const name = `Agent ${Date.now().toString(36)}`
                await db.insert(schema.aiAgent).values({
                  name,
                  memory: createInitialMemory(),
                })
                revalidatePath('/admin/ai-playtest')
                streamToast({
                  title: 'Agent Created',
                  description: `Created new agent: ${name}`,
                })
              })
            }}
          >
            <Plus className="size-4 mr-1" />
            New Agent
          </ActionButton>
        </div>

        {agents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No agents yet. Create one to start playtesting!
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => {
              const parsedAgent = AiAgent.parse(agent)
              return (
                <Fragment key={agent.id}>
                  <AgentCard agent={parsedAgent} />
                </Fragment>
              )
            })}
          </div>
        )}
      </div>

      {/* Recent Runs Section */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="size-5" />
          Recent Runs
        </h2>

        {runs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No runs yet. Start a playtest to see results here.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {runs.map((run) => (
              <Fragment key={run.id}>
                <AiPlaytestRunCard run={run} agentName={run.agent?.name} />
              </Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function AgentCard({ agent }: { agent: AiAgent }) {
  const winRate =
    agent.memory.totalRuns > 0
      ? ((agent.memory.totalWins / (agent.memory.totalWins + agent.memory.totalLosses)) * 100).toFixed(1)
      : '0'

  return (
    <div className="border rounded-lg p-4 flex flex-col gap-3">
      <div className="flex flex-row items-start justify-between">
        <div>
          <h3 className="font-medium">{agent.name}</h3>
          <p className="text-sm text-muted-foreground">
            {agent.memory.totalRuns} runs · {winRate}% win rate
          </p>
        </div>
        <ActionButton
          variant="ghost"
          size="icon"
          hideIcon
          askForConfirmation={{
            title: 'Delete Agent?',
            content: 'This will delete the agent and all its runs.',
          }}
          action={async () => {
            'use server'
            return superAction(async () => {
              // Delete runs first
              await db
                .delete(schema.aiPlaytestRun)
                .where(eq(schema.aiPlaytestRun.aiAgentId, agent.id))
              // Delete agent
              await db
                .delete(schema.aiAgent)
                .where(eq(schema.aiAgent.id, agent.id))
              revalidatePath('/admin/ai-playtest')
              streamToast({
                title: 'Agent Deleted',
                description: `Deleted agent: ${agent.name}`,
              })
            })
          }}
        >
          <Trash2 className="size-4" />
        </ActionButton>
      </div>

      {agent.memory.summary && (
        <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2 line-clamp-3">
          {agent.memory.summary}
        </div>
      )}

      <div className="flex flex-row gap-2">
        <ActionButton
          variant="default"
          size="sm"
          className="flex-1"
          action={async () => {
            'use server'
            return superAction(async () => {
              const ui = createStreamableUI(
                <AiPlaytestProgressDisplay
                  progress={{
                    roundNo: 0,
                    stepNo: 0,
                    gold: 0,
                    itemCount: 0,
                    wins: 0,
                    losses: 0,
                    status: 'shopping',
                  }}
                />,
              )

              streamDialog({
                title: `Running Playtest: ${agent.name}`,
                content: <>{ui.value}</>,
              })

              const config: AiPlaytestRunConfig = {
                maxRounds: 10,
                maxShopStepsPerRound: 50,
                maxActionRetries: 3,
                generateReport: true,
                generateSuggestions: true,
                updateMemory: true,
              }

              // Run the playtest with progress updates
              const result = await runAiPlaytest({
                agent,
                config,
                callbacks: {
                  onProgress: (progress) => {
                    ui.update(<AiPlaytestProgressDisplay progress={progress} />)
                  },
                },
              })

              // Generate reports if successful
              if (!result.error && config.generateReport) {
                ui.update(
                  <AiPlaytestProgressDisplay
                    progress={{
                      roundNo: result.finalRound,
                      stepNo: 0,
                      gold: 0,
                      itemCount: result.itemsBought.length,
                      wins: result.wins,
                      losses: result.losses,
                      status: 'completed',
                      lastAction: 'Generating reports...',
                    }}
                  />,
                )

                await generateAndSaveReports({ runId: result.runId })
              }

              ui.done(
                <div className="flex flex-col gap-4">
                  <AiPlaytestProgressDisplay
                    progress={{
                      roundNo: result.finalRound,
                      stepNo: 0,
                      gold: 0,
                      itemCount: result.itemsBought.length,
                      wins: result.wins,
                      losses: result.losses,
                      status: result.error ? 'failed' : 'completed',
                      error: result.error,
                    }}
                  />
                  <p className="text-sm text-muted-foreground">
                    Run complete! Check the runs list for detailed reports.
                  </p>
                </div>,
              )

              revalidatePath('/admin/ai-playtest')
            })
          }}
        >
          <Play className="size-4 mr-1" />
          Run Playtest
        </ActionButton>

        <ActionButton
          variant="outline"
          size="sm"
          hideIcon
          askForConfirmation={{
            title: 'Reset Memory?',
            content: "This will clear all the agent's learned insights.",
          }}
          action={async () => {
            'use server'
            return superAction(async () => {
              await db
                .update(schema.aiAgent)
                .set({ memory: createInitialMemory() })
                .where(eq(schema.aiAgent.id, agent.id))
              revalidatePath('/admin/ai-playtest')
              streamToast({
                title: 'Memory Reset',
                description: `Reset memory for: ${agent.name}`,
              })
            })
          }}
        >
          <RefreshCw className="size-4" />
        </ActionButton>
      </div>
    </div>
  )
}

