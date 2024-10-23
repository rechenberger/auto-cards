import { getIsAdmin } from '@/auth/getIsAdmin'
import { Game } from '@/db/schema-zod'
import { calcStats } from '@/game/calcStats'
import { gameAction } from '@/game/gameAction'
import { getSpecialBuyRound } from '@/game/getSpecialBuyRound'
import { orderItems } from '@/game/orderItems'
import { cn } from '@/lib/utils'
import { ActionButton } from '@/super-action/button/ActionButton'
import { pick } from 'lodash-es'
import { Fragment } from 'react'
import { BuyButton } from './BuyButton'
import { CardRow } from './CardRow'
import { GameMatchBoard } from './GameMatchBoard'
import { ItemCard } from './ItemCard'
import { ReRollButton } from './ReRollButton'
import { RoundInfoButton } from './RoundInfo'
import { StatsDisplay } from './StatsDisplay'

export const Shop = async ({ game }: { game: Game }) => {
  const isAdmin = await getIsAdmin({ allowDev: true })

  let shopItems = game.data.shopItems.map((shopItem, idx) => ({
    ...shopItem,
    idx,
  }))
  shopItems = await orderItems(shopItems)

  const stats = await calcStats({ loadout: game.data.currentLoadout })

  const specialBuyRound = getSpecialBuyRound({ game })
  shopItems = shopItems.filter(
    (shopItem) => !!shopItem.isSpecial === !!specialBuyRound,
  )

  return (
    <>
      <div className="flex flex-col md:flex-row gap-2 justify-center items-center">
        <StatsDisplay
          stats={{ gold: game.data.gold, ...pick(stats, ['space']) }}
          showZero
        />

        <div className="flex-1" />
        <div className="flex flex-row gap-1 items-center">
          <GameMatchBoard game={game} />
          <RoundInfoButton roundNo={game.data.roundNo} />
        </div>
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
            +{10} gold
          </ActionButton>
        )}
        <ReRollButton game={game} />
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
                  tooltipOnClick
                  size="160"
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
