import { CardTitle } from '@/components/ui/card'
import { Game } from '@/db/schema-zod'
import { ItemCardGrid } from '../ItemCardGrid'

export const CollectorOverview = ({ game }: { game: Game }) => {
  return (
    <>
      <CardTitle>Keep calm and collect</CardTitle>
      <ItemCardGrid items={game.data.currentLoadout.items} />
    </>
  )
}
