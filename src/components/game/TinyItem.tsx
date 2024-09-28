import { streamItemCard } from '@/components/game/streamItemCard'
import { getItemByName } from '@/game/allItems'
import { TinyItemClient } from './TinyItemClient'

export const TinyItem = async ({
  name,
  count = 1,
}: {
  name: string
  count?: number
}) => {
  const item = await getItemByName(name)
  const action = async () => {
    'use server'
    return streamItemCard({ name })
  }
  return (
    <>
      <TinyItemClient item={item} count={count} action={action} />
    </>
  )
}
