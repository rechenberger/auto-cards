import { getIsAdmin } from '@/auth/getIsAdmin'
import { Game } from '@/db/schema-zod'
import { gameAction } from '@/game/gameAction'
import { generateShopItems } from '@/game/generateShopItems'
import { ActionButton } from '@/super-action/button/ActionButton'
import { RotateCw } from 'lucide-react'
import { Fragment } from 'react'
import { CardRow } from './CardRow'
import { ItemCard } from './ItemCard'
import { StatsDisplay } from './StatsDisplay'

export const Shop = async ({ game }: { game: Game }) => {
  const priceToReroll = 1 // TODO: make this dynamic
  const isAdmin = await getIsAdmin({ allowDev: true })
  return (
    <>
      <div className="flex flex-row gap-2 justify-center items-center">
        <StatsDisplay stats={{ gold: game.data.gold }} showZero />
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
          {game.data.shopItems.map((shopItem, idx) => (
            <Fragment key={idx}>
              <ItemCard
                game={game}
                name={shopItem.name}
                shopItem={{ ...shopItem, idx }}
              />
            </Fragment>
          ))}
        </CardRow>
      </div>
    </>
  )
}
