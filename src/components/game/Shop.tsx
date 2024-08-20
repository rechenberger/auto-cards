import { getIsAdmin } from '@/auth/getIsAdmin'
import { Game } from '@/db/schema-zod'
import { calcStats } from '@/game/calcStats'
import { gameAction } from '@/game/gameAction'
import { generateShopItems } from '@/game/generateShopItems'
import { orderItems } from '@/game/orderItems'
import { cn } from '@/lib/utils'
import { ActionButton } from '@/super-action/button/ActionButton'
import { pick } from 'lodash-es'
import { RotateCw } from 'lucide-react'
import { Fragment } from 'react'
import { BuyButton } from './BuyButton'
import { CardRow } from './CardRow'
import { ItemCard } from './ItemCard'
import { StatsDisplay } from './StatsDisplay'

export const Shop = async ({ game }: { game: Game }) => {
  const priceToReroll = 1 // TODO: make this dynamic
  const isAdmin = await getIsAdmin({ allowDev: true })

  let shopItems = game.data.shopItems.map((shopItem, idx) => ({
    ...shopItem,
    idx,
  }))
  shopItems = await orderItems(shopItems)

  const stats = await calcStats({ loadout: game.data.currentLoadout })

  return (
    <>
      <div className="flex flex-row gap-2 justify-center items-center">
        <StatsDisplay
          stats={{ gold: game.data.gold, ...pick(stats, ['space']) }}
          showZero
        />
        <div className="flex-1" />
        {isAdmin && (
          <ActionButton
            catchToast
            hideIcon
            hideButton
            command={{}}
            action={async () => {
              'use server'
              return gameAction({
                gameId: game.id,
                action: async ({ ctx }) => {
                  ctx.game.data.gold += 10
                },
              })
            }}
          >
            +${10}
          </ActionButton>
        )}
        <ActionButton
          catchToast
          hideIcon
          variant={'outline'}
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
        >
          <RotateCw className="size-4 mr-2" />
          Re-Roll Shop (${priceToReroll})
        </ActionButton>
      </div>
      <div className="self-center max-w-full">
        <CardRow>
          {shopItems.map((shopItem) => (
            <Fragment key={shopItem.idx}>
              <div
                className={cn(
                  'flex flex-col gap-2 items-center justify-start',
                  shopItem.isSold && 'grayscale opacity-50',
                )}
              >
                <ItemCard
                  game={game}
                  name={shopItem.name}
                  shopItem={shopItem}
                />

                {!!game && !!shopItem && !shopItem.isSold && (
                  <>
                    <BuyButton game={game} shopItem={{ ...shopItem }} />
                  </>
                )}
              </div>
            </Fragment>
          ))}
        </CardRow>
      </div>
    </>
  )
}
