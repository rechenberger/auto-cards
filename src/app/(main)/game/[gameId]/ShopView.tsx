import { Game } from '@/db/schema-zod'
import { Shop } from './Shop'

export const ShopView = ({ game }: { game: Game }) => {
  return (
    <>
      <div className="flex-1 flex flex-col gap-4">
        <Shop game={game} />
        <div className="flex-1" />
        {/* <SimpleDataCard data={game} /> */}
      </div>
    </>
  )
}
