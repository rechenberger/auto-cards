'use client'

import { useCatalog, useMeta } from '@/client/api/catalog'
import { QueryError, QueryLoading } from '@/components/api/QueryState'
import { Card } from '@/components/ui/card'
import { getCraftingRecipes } from '@/game/craftingRecipes'
import { ItemCardClient } from '@/features/game/ItemCardClient'
import { ArrowRight, Plus } from 'lucide-react'

export const DocsCraftingClient = () => {
  const meta = useMeta()
  const catalog = useCatalog(meta.data?.viewer?.themeId)

  if (meta.isLoading || catalog.isLoading) {
    return <QueryLoading label="Loading recipes…" />
  }
  if (meta.error || catalog.error || !meta.data || !catalog.data) {
    return (
      <QueryError
        error={meta.error ?? catalog.error}
        retry={() => {
          meta.refetch()
          catalog.refetch()
        }}
      />
    )
  }

  const recipes = getCraftingRecipes(meta.data.rulesetVersion)
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
      {recipes.map((recipe, recipeIndex) => (
        <Card key={recipeIndex} className="bg-border/50 p-4">
          <div className="flex flex-col items-center gap-3 lg:flex-row">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {recipe.input.map((item, index) => (
                <div
                  key={`${item.name}-${index}`}
                  className="flex items-center gap-2"
                >
                  {index > 0 && <Plus className="size-6" aria-hidden="true" />}
                  <ItemCardClient
                    itemData={item}
                    catalog={catalog.data}
                    size="120"
                  />
                </div>
              ))}
            </div>
            <ArrowRight
              className="size-7 rotate-90 lg:rotate-0"
              aria-hidden="true"
            />
            <div className="flex flex-wrap items-center justify-center gap-2">
              {recipe.output.map((item, index) => (
                <div
                  key={`${item.name}-${index}`}
                  className="flex items-center gap-2"
                >
                  {index > 0 && <Plus className="size-6" aria-hidden="true" />}
                  <ItemCardClient
                    itemData={item}
                    catalog={catalog.data}
                    size="120"
                  />
                </div>
              ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
