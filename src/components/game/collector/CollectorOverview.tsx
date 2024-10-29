import { Game } from '@/db/schema-zod'
import { fontLore } from '@/lib/fonts'
import { cn } from '@/lib/utils'
import { CollectorAdminButtons } from './CollectorAdminButtons'
import { CollectorItemGrid } from './CollectorItemGrid'
import { CollectorLoadoutCheck } from './CollectorLoadoutCheck'

export const CollectorOverview = ({
  game,
  searchParams,
}: {
  game: Game
  searchParams: Promise<Record<string, string>>
}) => {
  return (
    <>
      <div className="flex flex-col gap-4 items-center">
        <div className={cn(fontLore.className, 'text-xl')}>
          keep calm and collect
        </div>
        <CollectorAdminButtons game={game} />
        <CollectorLoadoutCheck game={game} />
        <CollectorItemGrid game={game} searchParams={searchParams} />
      </div>
    </>
  )
}
