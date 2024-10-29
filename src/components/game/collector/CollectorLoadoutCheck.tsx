import { Card } from '@/components/ui/card'
import { Game } from '@/db/schema-zod'
import { cn } from '@/lib/utils'
import { capitalCase } from 'change-case'
import { CheckCircle, XCircle } from 'lucide-react'
import { Fragment } from 'react'
import { checkCollectorLoadout } from './checkCollectorLoadout'

export const CollectorLoadoutCheck = async ({ game }: { game: Game }) => {
  const check = await checkCollectorLoadout({
    loadout: game.data.currentLoadout,
  })
  return (
    <>
      <div className="flex flex-col xl:flex-row gap-2 flex-wrap xl:items-center">
        <Card
          className={cn(
            'px-2 py-1.5 flex flex-col gap-1',
            check.priceInBudget ? 'text-green-500' : 'bg-red-500',
          )}
        >
          <div className="flex flex-row gap-2 text-sm">
            {check.priceInBudget ? (
              <CheckCircle className="size-4" />
            ) : (
              <XCircle className="size-4" />
            )}
            <div className="flex-1">Space</div>
            <div>
              {check.priceLimit - check.priceCurrent}/{check.priceLimit}
            </div>
          </div>
        </Card>
        {check.countTooMany.map((i) => (
          <Fragment key={i.name}>
            <Card
              className={cn(
                'px-2 py-1.5 flex flex-col gap-1',
                check.countInBudget ? 'text-green-500' : 'bg-red-500',
              )}
            >
              <div className="flex flex-col text-sm">
                <div className="flex flex-row gap-2">
                  <div className="flex-1">Too many {capitalCase(i.name)}</div>
                  <div>
                    ({i.count}/{i.countMax})
                  </div>
                </div>
              </div>
            </Card>
          </Fragment>
        ))}
      </div>
    </>
  )
}
