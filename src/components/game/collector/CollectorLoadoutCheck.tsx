import { SimpleTooltip } from '@/components/simple/SimpleTooltip'
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
        <SimpleTooltip
          tooltip={
            check.priceInBudget ? (
              <>
                <div>
                  The items in your loadout
                  <br />
                  have a total weight of <strong>{check.priceCurrent}</strong>.
                </div>
                <div>
                  You can hold up to <strong>{check.priceLimit}</strong>.
                </div>
                <div>
                  You can add{' '}
                  <strong>{check.priceLimit - check.priceCurrent}</strong> more.
                </div>
              </>
            ) : (
              <>
                <div>
                  The items in your loadout
                  <br />
                  have a total weight of <strong>{check.priceCurrent}</strong>.
                </div>
                <div>
                  You can only hold up to <strong>{check.priceLimit}</strong>
                </div>
                <div>
                  You have to remove{' '}
                  <strong>{check.priceCurrent - check.priceLimit}</strong> to
                  fit.
                </div>
              </>
            )
          }
        >
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
              <div className="flex-1">Weight</div>
              <div>
                {/* {check.priceLimit - check.priceCurrent}/{check.priceLimit} */}
                {check.priceCurrent}/{check.priceLimit}
              </div>
            </div>
          </Card>
        </SimpleTooltip>
        {check.countTooMany.map((i) => (
          <Fragment key={i.name}>
            <SimpleTooltip
              tooltip={
                <>
                  <div>
                    You have {i.count}x {capitalCase(i.name)} in your loadout.
                  </div>
                  {i.def.unique ? (
                    <div>This item is unique and can only be held once.</div>
                  ) : (
                    <div>You can only hold up to {i.countMax}.</div>
                  )}
                </>
              }
            >
              <Card
                className={cn(
                  'px-2 py-1.5 flex flex-col gap-1',
                  check.countInBudget ? 'text-green-500' : 'bg-red-500',
                )}
              >
                <div className="flex flex-row gap-2 text-sm">
                  <XCircle className="size-4" />
                  <div className="flex-1">{capitalCase(i.name)}</div>
                  <div>
                    {i.count}/{i.countMax}
                  </div>
                </div>
              </Card>
            </SimpleTooltip>
          </Fragment>
        ))}
      </div>
    </>
  )
}
