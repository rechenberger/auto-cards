import { Game } from '@/db/schema-zod'
import { gameAction } from '@/game/gameAction'
import { generateShopItems } from '@/game/generateShopItems'
import { roundStats } from '@/game/roundStats'
import { ActionButton } from '@/super-action/button/ActionButton'

export const NextRoundButton = ({ game }: { game: Game }) => {
  return (
    <>
      <ActionButton
        catchToast
        action={async () => {
          'use server'
          return gameAction({
            gameId: game.id,
            action: async ({ ctx }) => {
              const { game } = ctx
              game.data.roundNo += 1
              game.data.shopRerolls = 0
              game.data.gold += roundStats[game.data.roundNo]?.gold ?? 0
              game.data.shopItems = await generateShopItems({ game })
            },
          })
        }}
      >
        Next Round
      </ActionButton>
    </>
  )
}
