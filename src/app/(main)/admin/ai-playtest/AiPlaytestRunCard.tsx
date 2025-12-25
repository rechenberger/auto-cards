import { TimeAgo } from '@/components/simple/TimeAgo'
import { Badge } from '@/components/ui/badge'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { AiPlaytestRun, AiPlaytestStep } from '@/db/schema-zod'
import { Markdown } from '@/components/demo/Markdown'
import {
  streamDialog,
  superAction,
} from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { eq } from 'drizzle-orm'
import { AlertCircle, CheckCircle, Eye, FileText, Lightbulb, Loader2 } from 'lucide-react'

type RunWithAgent = typeof schema.aiPlaytestRun.$inferSelect & {
  agent?: typeof schema.aiAgent.$inferSelect | null
}

export function AiPlaytestRunCard({
  run,
  agentName,
}: {
  run: RunWithAgent
  agentName?: string | null
}) {
  const statusIcon = {
    running: <Loader2 className="size-4 text-blue-500 animate-spin" />,
    completed: <CheckCircle className="size-4 text-green-500" />,
    failed: <AlertCircle className="size-4 text-red-500" />,
  }

  const statusVariant = {
    running: 'default' as const,
    completed: 'secondary' as const,
    failed: 'destructive' as const,
  }

  const winRate =
    run.wins + run.losses > 0
      ? ((run.wins / (run.wins + run.losses)) * 100).toFixed(0)
      : '0'

  return (
    <div className="border rounded-lg p-4 flex flex-col gap-3">
      <div className="flex flex-row items-start justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            {statusIcon[run.status]}
            <span className="font-medium">{agentName || 'Unknown Agent'}</span>
            <Badge variant={statusVariant[run.status]}>{run.status}</Badge>
          </div>
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <span>Round {(run.finalRound ?? 0) + 1}</span>
            <span>·</span>
            <span>{run.wins}W / {run.losses}L ({winRate}%)</span>
            <span>·</span>
            {run.createdAt && <TimeAgo date={new Date(run.createdAt)} />}
          </div>
        </div>

        <div className="flex flex-row gap-1">
          {/* View Steps */}
          <ActionButton
            variant="ghost"
            size="icon"
            hideIcon
            action={async () => {
              'use server'
              return superAction(async () => {
                const steps = await db.query.aiPlaytestStep.findMany({
                  where: eq(schema.aiPlaytestStep.runId, run.id),
                  orderBy: (s, { asc }) => [asc(s.roundNo), asc(s.stepNo)],
                })

                streamDialog({
                  title: 'Run Steps',
                  className: 'max-w-3xl max-h-[80vh] overflow-auto',
                  content: <StepsView steps={steps} />,
                })
              })
            }}
          >
            <Eye className="size-4" />
          </ActionButton>

          {/* View Report */}
          {run.summaryMarkdown && (
            <ActionButton
              variant="ghost"
              size="icon"
              hideIcon
              action={async () => {
                'use server'
                return superAction(async () => {
                  streamDialog({
                    title: 'Experience Report',
                    className: 'max-w-2xl max-h-[80vh] overflow-auto',
                    content: (
                      <div className="prose dark:prose-invert prose-sm max-w-none">
                        <Markdown>{run.summaryMarkdown || 'No report available'}</Markdown>
                      </div>
                    ),
                  })
                })
              }}
            >
              <FileText className="size-4" />
            </ActionButton>
          )}

          {/* View Suggestions */}
          {run.suggestionsMarkdown && (
            <ActionButton
              variant="ghost"
              size="icon"
              hideIcon
              action={async () => {
                'use server'
                return superAction(async () => {
                  streamDialog({
                    title: 'Content Suggestions',
                    className: 'max-w-2xl max-h-[80vh] overflow-auto',
                    content: (
                      <div className="prose dark:prose-invert prose-sm max-w-none">
                        <Markdown>{run.suggestionsMarkdown || 'No suggestions available'}</Markdown>
                      </div>
                    ),
                  })
                })
              }}
            >
              <Lightbulb className="size-4" />
            </ActionButton>
          )}
        </div>
      </div>

      {run.errorMessage && (
        <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/20 rounded p-2">
          {run.errorMessage}
        </div>
      )}
    </div>
  )
}

function StepsView({ steps }: { steps: (typeof schema.aiPlaytestStep.$inferSelect)[] }) {
  if (steps.length === 0) {
    return <div className="text-muted-foreground">No steps recorded</div>
  }

  // Group by round
  const roundGroups: Record<number, typeof steps> = {}
  for (const step of steps) {
    const roundNo = step.roundNo ?? 0
    if (!roundGroups[roundNo]) {
      roundGroups[roundNo] = []
    }
    roundGroups[roundNo].push(step)
  }

  return (
    <div className="flex flex-col gap-4">
      {Object.entries(roundGroups).map(([roundNo, roundSteps]) => (
        <div key={roundNo} className="flex flex-col gap-2">
          <h3 className="font-medium text-sm border-b pb-1">
            Round {Number(roundNo) + 1}
          </h3>
          <div className="flex flex-col gap-1 text-xs font-mono">
            {roundSteps.map((step) => {
              const parsedStep = AiPlaytestStep.parse(step)
              const action = parsedStep.action
              const result = parsedStep.result

              let actionText = ''
              switch (action.type) {
                case 'buy':
                  actionText = `BUY [${action.shopIndex}]`
                  break
                case 'reserve':
                  actionText = `RESERVE [${action.shopIndex}]`
                  break
                case 'unreserve':
                  actionText = `UNRESERVE [${action.shopIndex}]`
                  break
                case 'reroll':
                  actionText = 'REROLL'
                  break
                case 'endShop':
                  actionText = 'END_SHOP'
                  break
              }

              const statusColor = result.success
                ? 'text-green-600'
                : 'text-red-600'

              return (
                <div
                  key={step.id}
                  className="flex items-start gap-2 py-1 border-b border-dashed last:border-0"
                >
                  <span className="text-muted-foreground w-8">{step.stepNo}.</span>
                  <span className={statusColor}>{actionText}</span>
                  {action.reasoning && (
                    <span className="text-muted-foreground italic truncate flex-1">
                      "{action.reasoning}"
                    </span>
                  )}
                  {!result.success && result.error && (
                    <span className="text-red-500 text-[10px]">
                      ({result.error})
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

