import { Game } from '@/db/schema-zod'
import { getItemByName, ItemName } from '@/game/allItems'
import { gameAction } from '@/game/gameAction'
import { generateShopItems } from '@/game/generateShopItems'
import { roundStats } from '@/game/roundStats'
import { ActionButton } from '@/super-action/button/ActionButton'

export const NextRoundButton = ({ game }: { game: Game }) => {
  return (
    <>
      <ActionButton
        catchToast
        variant="outline"
        action={async () => {
          'use server'
          return gameAction({
            gameId: game.id,
            action: async ({ ctx }) => {
              const { game } = ctx
              game.data.roundNo += 1
              game.data.shopRerolls = 0
              game.data.gold += roundStats[game.data.roundNo]?.gold ?? 0

              const resolvedItems = await Promise.all(
                game.data.currentLoadout.items.map(async (i) => {
                  const resolvedItem = await getItemByName(i.name)
                  return { ...resolvedItem, count: i.count }
                }),
              )

              const onShopEnteredItems = resolvedItems.filter((i) => {
                return i?.triggers?.some((t) => t.type === 'onShopEntered')
              })

              for (const item of onShopEnteredItems) {
                const resolvedItem = await getItemByName(item.name)
                const trigger = resolvedItem.triggers?.filter(
                  (t) => t.type === 'onShopEntered',
                )
                if (trigger) {
                  for (const t of trigger) {
                    if (t.statsSelf?.gold) {
                      game.data.gold += t.statsSelf.gold * (item.count ?? 1)
                    }
                  }
                }
              }

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
