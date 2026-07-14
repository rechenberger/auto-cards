'use client'

import { AsyncButton } from '@/components/ui/async-button'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
import { cn } from '@/lib/utils'
import { Check, ExternalLink, Plus, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
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
  const countReady = recipes.filter((recipe) => recipe.hasAll).length
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="relative min-h-11 gap-2"
          disabled={disabled}
        >
          Crafting
          {recipes.length > 0 && (
            <span
              className={cn(
                'flex size-5 items-center justify-center rounded-full text-xs font-bold text-primary-foreground tabular-nums',
                countReady > 0 ? 'bg-primary' : 'bg-border',
              )}
              aria-label={`${countReady || recipes.length} crafting ${
                countReady > 0 ? 'recipes ready' : 'recipes discovered'
              }`}
            >
              {countReady || recipes.length}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="lg:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Crafting</DialogTitle>
          <DialogDescription>
            Combine items from your current loadout.
          </DialogDescription>
        </DialogHeader>
        {recipes.length === 0 ? (
          <div className="py-8 text-center">
            Buy more items to discover crafting recipes.
          </div>
        ) : (
          <div className="mx-auto flex max-h-[calc(100vh-14rem)] w-min max-w-full flex-col gap-4 overflow-auto px-1">
            {recipes.map((recipe, recipeIndex) => (
              <Card key={recipeIndex} className="bg-border/50 p-4">
                <div className="flex flex-col items-center gap-2 lg:flex-row">
                  {recipe.input.map((item, index) => (
                    <div key={`${item.name}-${index}`} className="contents">
                      {index > 0 && (
                        <Plus className="size-8" aria-hidden="true" />
                      )}
                      <div className="flex flex-col items-center gap-2 self-start">
                        <ItemCardClient
                          itemData={item}
                          catalog={catalog}
                          size="160"
                          onlyTop
                        />
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          {item.hasEnough ? (
                            <Check
                              className="size-4 text-green-500"
                              aria-hidden="true"
                            />
                          ) : (
                            <X
                              className="size-4 text-red-500"
                              aria-hidden="true"
                            />
                          )}
                          <span>
                            {item.countCurrent} of {item.count ?? 1}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="flex-1" />
                  <AsyncButton
                    disabled={disabled || !recipe.hasAll}
                    variant={recipe.hasAll ? 'default' : 'outline'}
                    className="min-h-11 min-w-24 lg:mb-12"
                    onAction={async () => {
                      await command({ type: 'craft', recipeIndex })
                      setOpen(false)
                    }}
                  >
                    Craft
                  </AsyncButton>
                  <div />
                  {recipe.output.map((item, index) => (
                    <div key={`${item.name}-${index}`} className="contents">
                      {index > 0 && (
                        <Plus className="size-8" aria-hidden="true" />
                      )}
                      <div className="flex flex-col items-center gap-2 self-start">
                        <ItemCardClient
                          itemData={item}
                          catalog={catalog}
                          size="160"
                          onlyTop
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
        <Button asChild variant="outline" className="mx-auto min-h-11">
          <Link href="/docs/crafting" target="_blank" rel="noreferrer">
            View All Recipes
            <ExternalLink className="ml-2 size-4" aria-hidden="true" />
          </Link>
        </Button>
      </DialogContent>
    </Dialog>
  )
}
