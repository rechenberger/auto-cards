'use client'

import { useCatalog, useMeta } from '@/client/api/catalog'
import { QueryError, QueryLoading } from '@/components/api/QueryState'
import { Card } from '@/components/ui/card'
import { getCraftingRecipes } from '@/game/craftingRecipes'
import { ItemCardClient } from '@/features/game/ItemCardClient'
import { ArrowDown, Plus } from 'lucide-react'

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
    <div className="mx-auto flex flex-col gap-4">
      {recipes.map((recipe, recipeIndex) => (
        <Card key={recipeIndex} className="bg-border/50 p-4">
          <div className="flex flex-col items-center gap-2 lg:flex-row">
            {recipe.input.map((item, index) => (
              <div key={`${item.name}-${index}`} className="contents">
                {index > 0 && <Plus className="size-8" aria-hidden="true" />}
                <div className="flex flex-col items-center gap-2 self-start">
                  <ItemCardClient
                    itemData={item}
                    catalog={catalog.data}
                    size="160"
                    onlyTop
                  />
                </div>
              </div>
            ))}
            <div className="flex-1" />
            <ArrowDown className="size-8 lg:-rotate-90" aria-hidden="true" />
            <div />
            {recipe.output.map((item, index) => (
              <div key={`${item.name}-${index}`} className="contents">
                {index > 0 && <Plus className="size-8" aria-hidden="true" />}
                <div className="flex flex-col items-center gap-2 self-start">
                  <ItemCardClient
                    itemData={item}
                    catalog={catalog.data}
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
  )
}
