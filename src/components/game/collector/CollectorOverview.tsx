import { Game } from '@/db/schema-zod'
import { fontLore } from '@/lib/fonts'
import { cn } from '@/lib/utils'
import { CollectorAdminButtons } from './CollectorAdminButtons'
import { CollectorItemGrid } from './CollectorItemGrid'

export const CollectorOverview = ({ game }: { game: Game }) => {
  return (
    <>
      <div className="flex flex-col gap-4 items-center">
        <div className={cn(fontLore.className, 'text-xl')}>
          keep calm and collect
        </div>
        <CollectorAdminButtons game={game} />
        <CollectorItemGrid game={game} />
      </div>
    </>
  )
}
