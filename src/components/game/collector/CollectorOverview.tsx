import { CardTitle } from '@/components/ui/card'
import { Game } from '@/db/schema-zod'
import { CollectorItemGrid } from './CollectorItemGrid'

export const CollectorOverview = ({ game }: { game: Game }) => {
  return (
    <>
      <CardTitle>Keep calm and collect</CardTitle>
      <CollectorItemGrid game={game} />
    </>
  )
}
