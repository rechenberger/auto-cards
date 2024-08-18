import { Game } from '@/db/schema-zod'
import { ItemName } from '@/game/allItems'
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
              const experience = roundStats[game.data.roundNo]?.experience ?? 0
              const expItem = game.data.currentLoadout.items.find(
                (i) => i.name === ('experience' satisfies ItemName),
              )
              if (expItem) {
                expItem.count = (expItem.count ?? 0) + experience
              } else {
                game.data.currentLoadout.items.push({
                  name: 'experience' satisfies ItemName,
                  count: experience,
                })
              }
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
