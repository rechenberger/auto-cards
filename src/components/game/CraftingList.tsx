import { Game } from '@/db/schema-zod'
import { gameAction } from '@/game/gameAction'
import { getCraftingRecipesGame } from '@/game/getCraftingRecipesGame'
import { negativeItems, sumItems } from '@/game/sumItems'
import { cn } from '@/lib/utils'
import { streamDialog } from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { map } from 'lodash-es'
import { ArrowDown, Check, Plus, X } from 'lucide-react'
import { Fragment } from 'react'
import { Card } from '../ui/card'
import { ItemCard } from './ItemCard'

export const CraftingList = async ({
  game,
  className,
}: {
  game?: Game
  className?: string
}) => {
  const recipes = await getCraftingRecipesGame({ game })
  const gameId = game?.id

  return (
    <>
      {!recipes.length && (
        <div>Buy more items to discover crafting recipes</div>
      )}
      <div className={cn('flex flex-col gap-4 mx-auto', className)}>
        {map(recipes, (recipe, idx) => (
          <Fragment key={idx}>
            <Card className="p-4 bg-border/50">
              <div className="flex flex-col lg:flex-row gap-2 items-center">
                {recipe.input.map((item, idx) => {
                  return (
                    <Fragment key={idx}>
                      {idx > 0 && <Plus className="size-8" />}
                      <div className="flex flex-col gap-2 items-center self-start">
                        <ItemCard
                          itemData={item}
                          tooltipOnClick
                          size="160"
                          onlyTop
                        />
                        {game && (
                          <div className="flex flex-row gap-1 items-center">
                            {item.hasEnough ? (
                              <Check className="size-4 text-green-500" />
                            ) : (
                              <X className="size-4 text-red-500" />
                            )}

                            <div className="text-sm text-gray-500">
                              {item.countCurrent} of {item.count ?? 1}
                            </div>
                          </div>
                        )}
                      </div>
                    </Fragment>
                  )
                })}
                <div className="flex-1" />
                {gameId ? (
                  <ActionButton
                    disabled={!recipe.hasAll}
                    variant={recipe.hasAll ? 'default' : 'outline'}
                    className="lg:mb-12"
                    action={async () => {
                      'use server'
                      return gameAction({
                        gameId,
                        action: async ({ ctx }) => {
                          ctx.game.data.currentLoadout.items = sumItems(
                            ctx.game.data.currentLoadout.items,
                            negativeItems(recipe.input),
                            recipe.output,
                          )

                          streamDialog(null)
                        },
                      })
                    }}
                  >
                    Craft
                  </ActionButton>
                ) : (
                  <>
                    <ArrowDown className="size-8 lg:-rotate-90" />
                  </>
                )}
                <div />
                {recipe.output.map((item, idx) => {
                  return (
                    <Fragment key={idx}>
                      {idx > 0 && <Plus className="size-8" />}
                      <div className="flex flex-col gap-2 items-center self-start">
                        <ItemCard
                          itemData={item}
                          tooltipOnClick
                          size="160"
                          onlyTop
                        />
                        <div></div>
                      </div>
                    </Fragment>
                  )
                })}
              </div>
            </Card>
          </Fragment>
        ))}
      </div>
    </>
  )
}
