import { authenticateWithApiKey } from '@/auth/getMyUserFromApiKey'
import { getItemByName, ItemName } from '@/game/allItems'
import { fight } from '@/game/fight'
import { gameActionRest } from '@/game/gameActionRest'
import { generateShopItems } from '@/game/generateShopItems'
import { getGameFromDb } from '@/game/getGame'
import { roundStats } from '@/game/roundStats'

export async function POST(
  req: Request,
  { params }: { params: { gameId: string } },
) {
  try {
    await authenticateWithApiKey(req)

    let hasWon: boolean | null = null

    await gameActionRest({
      gameId: params.gameId,
      action: async ({ ctx }) => {
        const { game } = ctx
        const { hasWon: fightHasWon } = await fight({ game })
        hasWon = fightHasWon

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

    return Response.json({ hasWon })
  } catch (e) {
    if (e instanceof Error) {
      return Response.json({ error: e.message }, { status: 400 })
    }
    return Response.json({ error: 'Unknown error' }, { status: 500 })
  }
}
