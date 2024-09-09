import { allRarityDefinitions } from '@/game/rarities'
import { roundStats } from '@/game/roundStats'
import { cn } from '@/lib/utils'
import {
  streamToast,
  superAction,
} from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { capitalCase } from 'change-case'
import { isNil, mapValues, omitBy, sum, values } from 'lodash-es'
import { Info } from 'lucide-react'
import { Fragment } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { ItemCard } from './ItemCard'
import { StatsDisplay } from './StatsDisplay'

export const RoundInfo = async ({ roundNo }: { roundNo: number }) => {
  const roundStat = roundStats[roundNo]
  const nextRoundStat = roundStats[roundNo + 1]

  if (!roundStat) return null

  const rarityWeights = omitBy(roundStat.rarityWeights, isNil)
  const weightSum = sum(values(rarityWeights))
  const rarityChances = mapValues(rarityWeights, (weight) => weight / weightSum)

  return (
    <>
      <div className="flex flex-col gap-2 self-center">
        <div className="text-center">Round {roundNo + 1}</div>
        <div className="flex flex-col gap-0 bg-border rounded-md px-4 py-2 ">
          <div className="font-bold mb-1 self-center">Shop Chances</div>
          {allRarityDefinitions.map((rarity) => (
            <Fragment key={rarity.name}>
              <div className={cn('flex flex-row gap-4', rarity.textClass)}>
                <div className="flex-1">{capitalCase(rarity.name)}</div>
                <div className="text-right">
                  {Math.round(100 * rarityChances[rarity.name] || 0)}%
                </div>
              </div>
            </Fragment>
          ))}
        </div>
        {!!nextRoundStat && (
          <>
            <div className="flex flex-col gap-2 bg-border rounded-md px-4 py-2 self-center">
              <div className="text-center">Next Round Gain</div>
              <StatsDisplay stats={{ gold: nextRoundStat.gold }} />
              <ItemCard
                name="experience"
                count={nextRoundStat.experience}
                size="160"
                tooltipOnClick
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
        <TooltipTrigger>
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
