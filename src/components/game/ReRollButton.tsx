import { Game } from '@/db/schema-zod'
import { gameAction } from '@/game/gameAction'
import { generateShopItems } from '@/game/generateShopItems'
import { cn } from '@/lib/utils'
import { ActionButton } from '@/super-action/button/ActionButton'
import { RotateCw } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { StatsDisplay } from './StatsDisplay'

export const priceToReroll = 1 // TODO: make this dynamic

export const ReRollButton = ({ game }: { game: Game }) => {
  const enoughGold = game.data.gold >= priceToReroll
  return (
    <>
      <Tooltip>
        <TooltipTrigger>
          <ActionButton
            catchToast
            hideIcon
            variant={'outline'}
            disabled={!enoughGold}
            action={async () => {
              'use server'
              return gameAction({
                gameId: game.id,
                action: async ({ ctx }) => {
                  const { game } = ctx
                  game.data.shopRerolls += 1
                  if (game.data.gold < priceToReroll) {
                    throw new Error('not enough gold')
                  }
                  game.data.gold -= priceToReroll
                  game.data.shopItems = await generateShopItems({ game })
                },
              })
            }}
            className={cn(
              'flex flex-row gap-2 items-center',
              !enoughGold && 'grayscale',
            )}
          >
            <RotateCw className="size-4" />
            {/* <div>Re-Roll Shop</div> */}
            <StatsDisplay disableTooltip stats={{ gold: priceToReroll }} />
          </ActionButton>
        </TooltipTrigger>
        <TooltipContent>Re-roll shop items</TooltipContent>
      </Tooltip>
    </>
  )
}
