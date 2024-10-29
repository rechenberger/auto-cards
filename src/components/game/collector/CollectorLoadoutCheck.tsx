import { Card } from '@/components/ui/card'
import { Game } from '@/db/schema-zod'
import { cn } from '@/lib/utils'
import { capitalCase } from 'change-case'
import { CheckCircle, XCircle } from 'lucide-react'
import { Fragment } from 'react'
import { checkCollectorLoadout } from './checkCollectorLoadout'

export const CollectorLoadoutCheck = async ({ game }: { game: Game }) => {
  const check = await checkCollectorLoadout({ game })
  return (
    <>
      <Card
        className={cn(
          'p-2 flex flex-col gap-1',
          check.allGood ? 'bg-green-500' : 'bg-red-500',
        )}
      >
        <div className="flex flex-row gap-2 items-center">
          {check.allGood ? (
            <CheckCircle className="size-4" />
          ) : (
            <XCircle className="size-4" />
          )}
          <div className="flex-1">
            {check.allGood ? 'Ready to fight' : 'Overloaded'}
          </div>
        </div>
        <div className="flex flex-col text-sm">
          {check.countTooMany.map((i) => (
            <Fragment key={i.name}>
              <div className="flex flex-row gap-2">
                <div className="flex-1">- too many {capitalCase(i.name)}</div>
                <div>
                  ({i.count}/{i.countMax})
                </div>
              </div>
            </Fragment>
          ))}
        </div>
      </Card>
    </>
  )
}
