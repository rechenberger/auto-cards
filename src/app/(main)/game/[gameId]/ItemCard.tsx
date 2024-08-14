import { AiImage } from '@/components/ai/AiImage'
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
import { Fragment } from 'react'
import { BuyButton } from './BuyButton'
import { StatsDisplay } from './StatsDisplay'
import { TriggerDisplay } from './TriggerDisplay'

export const ItemCard = async ({
  game,
  name,
  shopItem,
  size = '200',
  className,
}: {
  game?: Game
  name: string
  shopItem?: Game['data']['shopItems'][number] & { idx: number }
  size?: '480' | '320' | '240' | '200' | '160' | '80'
  className?: string
}) => {
  const item = await getItemByName(name)
  const title = capitalCase(name)

  return (
    <>
      <HoverCard>
        <HoverCardTrigger>
          <div
            className={cn(
              'dark',
              'rounded-xl',
              'w-[320px] h-[500px]',
              'p-2',
              'bg-[#313130] text-white',
              'shadow-lg',
              'relative',
              'flex flex-col gap-2',
              // 'overflow-hidden',
              'group',
              size === '80' && 'scale-[25%] -mx-[120px] -my-[187.5px]',
              size === '160' && 'scale-[50%] -mx-[80px] -my-[125px]',
              size === '200' && 'scale-[62.5%] -mx-[60px] -my-[93.75px]', // (500-500/1.6)/2 = 93.75
              size === '240' && 'scale-[75%] -mx-[40px] -my-[62.5px]', // (500-500*0,75)/2 = 62.5
              size === '480' && 'lg:scale-[150%] lg:mx-[80px] lg:my-[125px]', // (500-500*1,5)/2 = 15
              className,
            )}
          >
            <div
              className={cn(
                'aspect-square relative rounded-tr-lg rounded-b-lg overflow-hidden bg-black',
                'text-white',
                // 'text-amber-400',
                'font-bold',
                '[text-shadow:_1px_1px_4px_rgb(0_0_0_/_80%)]',
                // fontHeading.className,
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
                <div className="border-black border-2 rounded-lg overflow-hidden">
                  <AiImage
                    prompt={`Cartoony cozy Image of ${title}. Background is a sunny track trough the mountains or woods whatever fits.`}
                  />
                </div>
              </div>
              {!!shopItem?.isSold && (
                <>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-red-500 border-8 border-red-500 font-black px-4 py-2 text-3xl bg-black/80 -rotate-12">
                      SOLD
                    </div>
                  </div>
                </>
              )}
              {!!shopItem?.isReserved && (
                <>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-green-500 border-8 border-green-500 font-black px-4 py-2 text-3xl bg-black/80 -rotate-12">
                      RESERVED
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="flex-1" />
            <div className="text-center">
              <div className="flex flex-col gap-4">
                {item.stats && <StatsDisplay relative stats={item.stats} />}
                {item.triggers?.map((trigger, idx) => (
                  <Fragment key={idx}>
                    <TriggerDisplay trigger={trigger} />
                  </Fragment>
                ))}
              </div>
            </div>
            <div className="flex-1" />
            <div>
              <div className="flex flex-row gap-2 justify-end items-center">
                {!!game && !!shopItem && !shopItem.isSold && (
                  <>
                    <label className="flex flex-row gap-1">
                      <ActionButton
                        variant={'secondary'}
                        size={'icon'}
                        className={cn(shopItem.isReserved && 'text-green-500')}
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
                          <Lock className="size-4" strokeWidth={3} />
                        ) : (
                          <LockOpen className="size-4" strokeWidth={3} />
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
        </HoverCardTrigger>
        <HoverCardContent>
          <div className="flex flex-col gap-4">
            {item.stats && <StatsDisplay relative stats={item.stats} />}
            {item.triggers?.map((trigger, idx) => (
              <Fragment key={idx}>
                <TriggerDisplay trigger={trigger} />
              </Fragment>
            ))}
          </div>
        </HoverCardContent>
      </HoverCard>
    </>
  )
}
