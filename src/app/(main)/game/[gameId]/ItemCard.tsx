import { AiImage } from '@/components/ai/AiImage'
import { SimpleDataCard } from '@/components/simple/SimpleDataCard'
import { Card } from '@/components/ui/card'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { Game } from '@/db/schema-zod'
import { getItemByName } from '@/game/allItems'
import { gameAction } from '@/game/gameAction'
import { cn } from '@/lib/utils'
import { ActionButton } from '@/super-action/button/ActionButton'
import { capitalCase } from 'change-case'
import { Lock, LockOpen } from 'lucide-react'
import { BuyButton } from './BuyButton'

export const ItemCard = async ({
  game,
  name,
  shopItem,
}: {
  game?: Game
  name: string
  shopItem?: Game['data']['shopItems'][number] & { idx: number }
}) => {
  const item = await getItemByName(name)
  const title = capitalCase(name)

  return (
    <>
      <HoverCard>
        <HoverCardTrigger>
          <Card className="p-4 flex flex-col gap-2">
            <h2>{title}</h2>
            <AiImage
              prompt={`Cartoony cozy Image of ${title}. Background is a sunny track trough the mountains or woods whatever fits.`}
            />
            <div className="opacity-60 text-sm">{item.tags?.join(',')}</div>
            <div className="flex-1" />
            <div className="flex flex-row gap-2 justify-end items-center">
              {!!game && !!shopItem && (
                <>
                  <label className="flex flex-row gap-1">
                    <ActionButton
                      variant={'ghost'}
                      size={'icon'}
                      className={cn(shopItem.isReserved && 'text-primary')}
                      hideIcon
                      action={async () => {
                        'use server'
                        return gameAction({
                          gameId: game.id,
                          action: async ({ ctx }) => {
                            const s = ctx.game.data.shopItems[shopItem.idx]
                            s.isReserved = !s.isReserved
                          },
                        })
                      }}
                    >
                      {shopItem.isReserved ? (
                        <Lock className="size-4" />
                      ) : (
                        <LockOpen className="size-4" />
                      )}
                    </ActionButton>
                  </label>
                  <div className="flex-1" />
                  <BuyButton game={game} shopItem={{ ...shopItem, item }} />
                </>
              )}
            </div>
          </Card>
        </HoverCardTrigger>
        <HoverCardContent>
          <SimpleDataCard data={[item.stats, ...(item.triggers ?? [])]} />
        </HoverCardContent>
      </HoverCard>
    </>
  )
}
