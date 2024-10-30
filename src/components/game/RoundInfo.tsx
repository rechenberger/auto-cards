import { roundStats } from '@/game/roundStats'
import {
  streamToast,
  superAction,
} from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { ItemCard } from './ItemCard'
import { RarityWeightsDisplay } from './RarityWeightsDisplay'
import { StatsDisplay } from './StatsDisplay'

export const RoundInfo = async ({ roundNo }: { roundNo: number }) => {
  const roundStat = roundStats[roundNo]
  const nextRoundStat = roundStats[roundNo + 1]

  if (!roundStat) return null

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="text-center">Round {roundNo + 1}</div>
        <div className="flex flex-col gap-0 bg-border rounded-md px-4 py-2 ">
          <div className="font-bold mb-1 self-center">Shop Chances</div>
          <RarityWeightsDisplay rarityWeights={roundStat.rarityWeights} />
        </div>
        {!!nextRoundStat && (
          <>
            <div className="flex flex-col gap-2 bg-border rounded-md px-4 py-2 self-center">
              <div className="text-center">Next Round Gain</div>
              <StatsDisplay stats={{ gold: nextRoundStat.gold }} />
              <ItemCard
                itemData={{
                  name: 'experience',
                  count: nextRoundStat.experience,
                }}
                size="160"
                tooltipOnClick
                onlyTop
              />
            </div>
          </>
        )}
      </div>
    </>
  )
}

export const RoundInfoButton = ({ roundNo }: { roundNo: number }) => {
  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <ActionButton
            size="icon"
            variant={'ghost'}
            hideIcon
            className="rounded-full"
            action={async () => {
              'use server'
              return superAction(async () => {
                streamToast({
                  description: <RoundInfo roundNo={roundNo} />,
                })
              })
            }}
          >
            <Info className="size-4" />
          </ActionButton>
        </TooltipTrigger>
        <TooltipContent>
          <RoundInfo roundNo={roundNo} />
        </TooltipContent>
      </Tooltip>
    </>
  )
}
