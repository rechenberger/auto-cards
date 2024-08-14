import { AiImage } from '@/components/ai/AiImage'
import { SimpleDataCard } from '@/components/simple/SimpleDataCard'
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
          <div
            className={cn(
              'flex flex-col gap-2',
              'dark text-white rounded-xl overflow-hidden',
              'p-2',
              'bg-[#313130]',
              'relative',
            )}
          >
            <div className="relative rounded-tr-lg rounded-b-lg overflow-hidden">
              <div className="absolute top-0 inset-x-0 flex flex-col items-start">
                <div
                  className={cn(
                    'bg-[#313130] pl-4 pr-6 pb-1.5',
                    'rounded-br-[20px]',
                    'border-b-2 border-r-2 border-black',
                  )}
                >
                  {title}
                </div>
              </div>
              <div className="absolute top-3 inset-x-0 flex flex-col items-end">
                <div
                  className={cn(
                    'bg-[#313130] pl-4 pr-3 py-1',
                    'rounded-l-full',
                    'border-l-2 border-y-2 border-black',
                  )}
                >
                  <div className="text-xs">
                    {item.tags?.map((t) => capitalCase(t)).join(',')}
                  </div>
                </div>
              </div>
              <AiImage
                prompt={`Cartoony cozy Image of ${title}. Background is a sunny track trough the mountains or woods whatever fits.`}
              />
              <div className="absolute bottom-0 inset-x-0 p-1">
                <div className="flex flex-row gap-2 justify-end items-center">
                  {!!game && !!shopItem && (
                    <>
                      <label className="flex flex-row gap-1">
                        <ActionButton
                          variant={'secondary'}
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
              </div>
            </div>
          </div>
        </HoverCardTrigger>
        <HoverCardContent>
          <SimpleDataCard data={[item.stats, ...(item.triggers ?? [])]} />
        </HoverCardContent>
      </HoverCard>
    </>
  )
}
