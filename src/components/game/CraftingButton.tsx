import { Game } from '@/db/schema-zod'
import { getCraftingRecipesGame } from '@/game/getCraftingRecipesGame'
import {
  streamDialog,
  superAction,
} from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { map } from 'lodash-es'
import { ArrowRight, Check, Plus, X } from 'lucide-react'
import { Fragment } from 'react'
import { Card } from '../ui/card'
import { ItemCard } from './ItemCard'

export const CraftingButton = async ({ game }: { game: Game }) => {
  const recipes = await getCraftingRecipesGame({ game })

  return (
    <>
      <ActionButton
        variant="outline"
        catchToast
        action={async () => {
          'use server'
          return superAction(async () => {
            streamDialog({
              title: 'Crafting',
              content: (
                <>
                  {map(recipes, (recipe, idx) => (
                    <Fragment key={idx}>
                      <Card className="p-4">
                        <div className="flex flex-row gap-2 items-center">
                          {recipe.input.map((item, idx) => {
                            return (
                              <Fragment key={idx}>
                                {idx > 0 && <Plus className="size-8 mb-12" />}
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
                          <ArrowRight className="size-8 mb-12" />
                          <div />
                          {recipe.output.map((item, idx) => {
                            return (
                              <Fragment key={idx}>
                                {idx > 0 && <Plus className="size-8 mb-12" />}
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
                </>
              ),
            })
          })
        }}
      >
        Crafting
      </ActionButton>
    </>
  )
}
