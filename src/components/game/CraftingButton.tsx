import { Game } from '@/db/schema-zod'
import { countifyItems } from '@/game/countifyItems'
import { gameAction } from '@/game/gameAction'
import { getCraftingRecipesGame } from '@/game/getCraftingRecipesGame'
import { cn } from '@/lib/utils'
import {
  streamDialog,
  superAction,
} from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { map } from 'lodash-es'
import { Check, Plus, X } from 'lucide-react'
import { Fragment } from 'react'
import { Card } from '../ui/card'
import { ItemCard } from './ItemCard'

export const CraftingButton = async ({ game }: { game: Game }) => {
  const recipes = await getCraftingRecipesGame({ game })
  const countReady = recipes.filter((r) => r.hasAll).length
  const gameId = game.id

  return (
    <>
      <ActionButton
        variant="outline"
        catchToast
        hideIcon
        className="relative flex flex-row gap-2"
        action={async () => {
          'use server'
          return superAction(async () => {
            streamDialog({
              title: 'Crafting',
              className: 'max-w-3xl',
              content: (
                <>
                  <div className="flex flex-col gap-4 mx-auto w-min max-h-[calc(100vh-10rem)] overflow-auto">
                    {map(recipes, (recipe, idx) => (
                      <Fragment key={idx}>
                        <Card className="p-4 bg-border/50">
                          <div className="flex flex-col md:flex-row gap-2 items-center">
                            {recipe.input.map((item, idx) => {
                              return (
                                <Fragment key={idx}>
                                  {idx > 0 && (
                                    <Plus className="size-8 md:mb-12" />
                                  )}
                                  <div className="flex flex-col gap-2 items-center self-start">
                                    <ItemCard
                                      name={item.name}
                                      count={item.count}
                                      tooltipOnClick
                                      size="160"
                                    />
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
                                  </div>
                                </Fragment>
                              )
                            })}
                            <div className="flex-1" />
                            <ActionButton
                              disabled={!recipe.hasAll}
                              variant={recipe.hasAll ? 'default' : 'outline'}
                              className="md:mb-12"
                              action={async () => {
                                'use server'
                                return gameAction({
                                  gameId,
                                  action: async ({ ctx }) => {
                                    ctx.game.data.currentLoadout.items =
                                      countifyItems(
                                        ctx.game.data.currentLoadout.items,
                                      )

                                    // Take Input
                                    for (const item of recipe.input) {
                                      const itemInInventory =
                                        ctx.game.data.currentLoadout.items.find(
                                          (i) => i.name === item.name,
                                        )
                                      if (!itemInInventory) {
                                        throw new Error(`Missing ${item.name}`)
                                      }
                                      itemInInventory.count =
                                        (itemInInventory.count ?? 1) -
                                        (item.count ?? 1)
                                      if (itemInInventory.count < 0) {
                                        throw new Error(`Missing ${item.name}`)
                                      }
                                    }
                                    ctx.game.data.currentLoadout.items =
                                      ctx.game.data.currentLoadout.items.filter(
                                        (i) => i.count !== 0,
                                      )

                                    // Give Output
                                    for (const item of recipe.output) {
                                      ctx.game.data.currentLoadout.items.push({
                                        name: item.name,
                                        count: item.count ?? 1,
                                      })
                                    }
                                    ctx.game.data.currentLoadout.items =
                                      countifyItems(
                                        ctx.game.data.currentLoadout.items,
                                      )

                                    streamDialog(null)
                                  },
                                })
                              }}
                            >
                              Craft
                            </ActionButton>
                            <div />
                            {recipe.output.map((item, idx) => {
                              return (
                                <Fragment key={idx}>
                                  {idx > 0 && (
                                    <Plus className="size-8 md:mb-12" />
                                  )}
                                  <div className="flex flex-col gap-2 items-center self-start">
                                    <ItemCard
                                      name={item.name}
                                      count={item.count}
                                      tooltipOnClick
                                      size="160"
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
              ),
            })
          })
        }}
      >
        Crafting
        {recipes.length > 0 && (
          <div
            className={cn(
              // 'absolute -top-2.5 -right-2.5',
              'size-5 text-center rounded-full  text-xs font-bold flex items-center justify-center',
              countReady > 0
                ? 'bg-primary text-primary-foreground'
                : 'bg-border text-primary-foreground',
            )}
          >
            {countReady || recipes.length}
          </div>
        )}
      </ActionButton>
    </>
  )
}
