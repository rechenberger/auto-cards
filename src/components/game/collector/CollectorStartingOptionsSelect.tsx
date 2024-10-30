import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Game } from '@/db/schema-zod'
import { gameAction } from '@/game/gameAction'
import { fontHeading, fontLore } from '@/lib/fonts'
import { cn } from '@/lib/utils'
import { ActionButton } from '@/super-action/button/ActionButton'
import { Fragment } from 'react'
import { AlphaTag } from '../AlphaTag'
import { ItemCard } from '../ItemCard'
import { collectorStartingOptions } from './collectorStatingOptions'

export const CollectorStartingOptionsSelect = ({ game }: { game: Game }) => {
  return (
    <>
      <div className="flex flex-col gap-12">
        <div className="flex flex-col items-center mt-20">
          <AlphaTag />
          <h1 className={(cn(fontHeading.className), 'text-3xl self-center')}>
            Welcome Collector
          </h1>
          <div className={cn(fontLore.className, 'text-sm opacity-80')}>
            Choose your starter to begin your adventure.
          </div>
        </div>
        <div className="flex flex-col xl:flex-row gap-4 self-center">
          {collectorStartingOptions.map((option, idx) => (
            <Fragment key={idx}>
              <Card>
                <CardHeader>
                  <CardTitle>{option.name}</CardTitle>
                  <CardDescription className={fontLore.className}>
                    {option.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 items-center">
                  <div className="flex-1 flex flex-row flex-wrap gap-2 items-center justify-center">
                    {option.items().map((item, idx) => (
                      <Fragment key={idx}>
                        <ItemCard
                          itemData={item}
                          size={'160'}
                          onlyTop={false}
                          tooltipOnClick
                        />
                      </Fragment>
                    ))}
                  </div>
                  <ActionButton
                    action={async () => {
                      'use server'
                      return gameAction({
                        gameId: game.id,
                        action: async ({ ctx }) => {
                          const option = collectorStartingOptions[idx]
                          const items = option.items()
                          ctx.game.data.currentLoadout.items = items
                          ctx.game.data.inventory = {
                            items: items.filter((i) => i.id),
                          }
                        },
                      })
                    }}
                  >
                    Start as {option.name}
                  </ActionButton>
                </CardContent>
              </Card>
            </Fragment>
          ))}
        </div>
      </div>
    </>
  )
}
