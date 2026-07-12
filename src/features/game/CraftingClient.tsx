'use client'

import { AsyncButton } from '@/components/ui/async-button'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { CatalogResponse } from '@/contracts/catalog'
import { GameCommand, GameViewDto } from '@/contracts/game-api'
import { getCraftingRecipesGame } from '@/game/getCraftingRecipesGame'
import { ArrowRight, Plus } from 'lucide-react'
import { ItemCardClient } from './ItemCardClient'

export const CraftingClient = ({
  view,
  catalog,
  command,
  disabled = false,
}: {
  view: GameViewDto
  catalog: CatalogResponse
  command: (command: GameCommand) => Promise<unknown>
  disabled?: boolean
}) => {
  const recipes = getCraftingRecipesGame({ game: view.game })

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          disabled={disabled}
        >
          Crafting
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Crafting</DialogTitle>
          <DialogDescription>
            Combine items from your current loadout. The server validates every
            recipe before applying it.
          </DialogDescription>
        </DialogHeader>
        {recipes.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            Buy more items to discover crafting recipes.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {recipes.map((recipe, recipeIndex) => (
              <div
                key={recipeIndex}
                className="flex flex-col items-center gap-3 rounded-xl border bg-muted/30 p-4 lg:flex-row"
              >
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {recipe.input.map((item, index) => (
                    <div
                      key={`${item.name}-${index}`}
                      className="flex items-center gap-2"
                    >
                      {index > 0 && (
                        <Plus className="size-5" aria-hidden="true" />
                      )}
                      <div className="flex flex-col items-center gap-1">
                        <ItemCardClient
                          itemData={item}
                          catalog={catalog}
                          size="120"
                        />
                        <span className="text-xs text-muted-foreground">
                          {item.countCurrent}/{item.count ?? 1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <ArrowRight
                  className="size-6 rotate-90 lg:rotate-0"
                  aria-hidden="true"
                />
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {recipe.output.map((item) => (
                    <ItemCardClient
                      key={item.name}
                      itemData={item}
                      catalog={catalog}
                      size="120"
                    />
                  ))}
                </div>
                <div className="flex-1" />
                <AsyncButton
                  disabled={disabled || !recipe.hasAll}
                  className="min-h-11 min-w-28"
                  onAction={() => command({ type: 'craft', recipeIndex })}
                >
                  Craft
                </AsyncButton>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
