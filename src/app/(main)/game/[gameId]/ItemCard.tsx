import { SimpleDataCard } from '@/components/simple/SimpleDataCard'
import { Card } from '@/components/ui/card'
import { Game } from '@/db/schema-zod'
import { getItemByName } from '@/game/allItems'
import { updateGame } from '@/game/updateGame'
import {
  streamToast,
  superAction,
} from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { capitalCase } from 'change-case'
import { revalidatePath } from 'next/cache'

export const ItemCard = async ({
  game,
  name,
  shopItem,
}: {
  game: Game
  name: string
  shopItem?: Game['data']['shopItems'][number] & { idx: number }
}) => {
  const def = await getItemByName(name)
  const title = capitalCase(name)

  let price = def.price
  if (shopItem?.isOnSale) {
    price = Math.ceil(price * 0.5)
  }

  return (
    <>
      <Card className="p-4 flex flex-col gap-2">
        <h2>{title}</h2>
        {/* <AiImage
          prompt={`A beatiful but simple icon of ${title}. With a dark background.`}
        /> */}
        <div className="opacity-60 text-sm">{def.tags?.join(',')}</div>
        <SimpleDataCard data={[def.stats, ...(def.triggers ?? [])]} />
        <div className="flex-1" />
        <div className="flex flex-row gap-2 justify-end">
          {!!shopItem && (
            <>
              <ActionButton
                hideIcon
                catchToast
                disabled={shopItem.isSold}
                action={async () => {
                  'use server'
                  return superAction(async () => {
                    if (game.data.gold < price) {
                      throw new Error('Not enough gold')
                    }
                    game.data.gold -= price
                    const s = game.data.shopItems[shopItem.idx]
                    if (s.isSold) {
                      throw new Error('Already sold')
                    }
                    s.isSold = true
                    s.isReserved = false

                    game.data.currentLoadout.items = [
                      ...game.data.currentLoadout.items,
                      { name },
                    ]

                    await updateGame({
                      game,
                    })
                    revalidatePath('/', 'layout')
                    streamToast({
                      title: 'Item sold',
                      description: `You bought ${title} for ${price} gold`,
                    })
                  })
                }}
              >
                ${price}
                {shopItem.isOnSale && ' (SALE)'}
              </ActionButton>
            </>
          )}
        </div>
      </Card>
    </>
  )
}
