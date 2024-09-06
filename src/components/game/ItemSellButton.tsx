import { gameAction } from '@/game/gameAction'
import { ItemDefinition } from '@/game/ItemDefinition'
import { negativeItems, sumItems } from '@/game/sumItems'
import { ActionButton } from '@/super-action/button/ActionButton'
import { capitalCase } from 'change-case'
import { StatsDisplay } from './StatsDisplay'

export const ItemSellButton = ({
  gameId,
  item,
}: {
  gameId?: string
  item: ItemDefinition
}) => {
  if (!gameId || item.price <= 0) {
    return null
  }

  const sellPrice = Math.ceil(item.price / 2)
  return (
    <>
      <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity inset-x-0 top-12 z-10 flex flex-col items-center">
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
