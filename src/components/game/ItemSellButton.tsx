import { BetterItemDefinition } from '@/game/allItems'
import { gameAction } from '@/game/gameAction'
import { negativeItems, sumItems } from '@/game/sumItems'
import { ActionButton } from '@/super-action/button/ActionButton'
import { capitalCase } from 'change-case'
import { StatsDisplay } from './StatsDisplay'

export const ItemSellButton = ({
  gameId,
  item,
}: {
  gameId?: string
  item: BetterItemDefinition
}) => {
  const sellPrice = item.sellPrice ?? Math.ceil(item.price / 2)
  if (!gameId || sellPrice <= 0) {
    return null
  }

  return (
    <>
      <div className="absolute md:opacity-0 group-hover:opacity-100 transition-opacity inset-x-0 top-12 z-10 flex flex-col items-center">
        <ActionButton
          variant="outline"
          size="sm"
          askForConfirmation={{
            title: `Sell ${capitalCase(item.name)}?`,
            confirm: (
              <>
                <div className="flex flex-row gap-2 items-center">
                  <div>Yes</div>
                  <StatsDisplay
                    stats={{ gold: sellPrice }}
                    showZero
                    size="sm"
                    disableTooltip
                  />
                </div>
              </>
            ),
          }}
          stopPropagation
          hideIcon
          className="flex flex-row gap-2 items-center"
          action={async () => {
            'use server'
            return gameAction({
              gameId: gameId!,
              action: async ({ ctx }) => {
                ctx.game.data.currentLoadout.items = sumItems(
                  ctx.game.data.currentLoadout.items,
                  negativeItems([item]),
                )
                ctx.game.data.gold += sellPrice
              },
            })
          }}
        >
          <div>Sell</div>
          <StatsDisplay stats={{ gold: sellPrice }} showZero disableTooltip />
        </ActionButton>
      </div>
    </>
  )
}
