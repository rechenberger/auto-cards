'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CatalogResponse } from '@/contracts/catalog'
import { collectorStartingOptions } from '@/game/collector/startingOptions'
import { fontHeading, fontLore } from '@/lib/fonts'
import { cn } from '@/lib/utils'
import { ItemCardClient } from '@/features/game/ItemCardClient'
import { AlphaTag } from '../AlphaTag'
import {
  CollectorCommandButton,
  CollectorCommandHandler,
} from './CollectorCommandButton'

export const CollectorStartingOptionsSelect = ({
  catalog,
  onCommand,
  pending,
}: {
  catalog: CatalogResponse
  onCommand: CollectorCommandHandler
  pending: boolean
}) => (
  <div className="flex flex-col gap-12">
    <div className="mt-20 flex flex-col items-center text-center">
      <AlphaTag />
      <h1 className={cn(fontHeading.className, 'mt-2 text-3xl')}>
        Welcome Collector
      </h1>
      <p className={cn(fontLore.className, 'text-sm opacity-80')}>
        Choose your starter to begin your adventure.
      </p>
    </div>
    <div className="flex flex-col gap-4 self-center xl:flex-row">
      {collectorStartingOptions.map((option) => (
        <Card key={option.id} className="flex max-w-md flex-col">
          <CardHeader>
            <CardTitle>{option.name}</CardTitle>
            <CardDescription className={fontLore.className}>
              {option.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col items-center gap-4">
            <div className="flex flex-1 flex-wrap items-center justify-center gap-2">
              {option.previewItems.map((item, index) => (
                <ItemCardClient
                  key={`${item.name}-${index}`}
                  itemData={item}
                  catalog={catalog}
                  size="160"
                />
              ))}
            </div>
            <CollectorCommandButton
              command={{ type: 'choose-starter', starterId: option.id }}
              onCommand={onCommand}
              pending={pending}
              className="w-full"
            >
              Start as {option.name}
            </CollectorCommandButton>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
)
