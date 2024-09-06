import { Game } from '@/db/schema-zod'
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
                                return superAction(async () => {
                                  // await craftRecipe({ game, recipe })
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
