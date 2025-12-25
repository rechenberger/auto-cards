'use client'

import { Progress } from '@/components/ui/progress'
import { AiPlaytestProgress } from '@/ai'
import { AlertCircle, CheckCircle, Loader2, ShoppingBag, Swords } from 'lucide-react'

export function AiPlaytestProgressDisplay({
  progress,
}: {
  progress: AiPlaytestProgress
}) {
  const totalRounds = 10 // Default max rounds
  const progressPercent = ((progress.roundNo + 1) / totalRounds) * 100

  const statusIcon = {
    shopping: <ShoppingBag className="size-4 text-blue-500 animate-pulse" />,
    fighting: <Swords className="size-4 text-orange-500 animate-bounce" />,
    advancing: <Loader2 className="size-4 text-purple-500 animate-spin" />,
    completed: <CheckCircle className="size-4 text-green-500" />,
    failed: <AlertCircle className="size-4 text-red-500" />,
  }

  const statusText = {
    shopping: 'Shopping...',
    fighting: 'Fighting!',
    advancing: 'Advancing to next round...',
    completed: 'Playtest Complete!',
    failed: 'Playtest Failed',
  }

  return (
    <div className="flex flex-col gap-4 min-w-[300px]">
      {/* Progress bar */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-sm">
          <span>Round {progress.roundNo + 1} of {totalRounds}</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <Progress value={progressPercent} />
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        {statusIcon[progress.status]}
        <span className="font-medium">{statusText[progress.status]}</span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex flex-col">
          <span className="text-muted-foreground">Gold</span>
          <span className="font-mono text-lg">{progress.gold}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground">Items</span>
          <span className="font-mono text-lg">{progress.itemCount}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground">Wins</span>
          <span className="font-mono text-lg text-green-600">{progress.wins}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground">Losses</span>
          <span className="font-mono text-lg text-red-600">{progress.losses}</span>
        </div>
      </div>

      {/* Last action */}
      {progress.lastAction && (
        <div className="text-sm text-muted-foreground border-t pt-2">
          <span className="font-medium">Last action:</span> {progress.lastAction}
        </div>
      )}

      {/* Error message */}
      {progress.error && (
        <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/20 rounded p-2">
          {progress.error}
        </div>
      )}
    </div>
  )
}

