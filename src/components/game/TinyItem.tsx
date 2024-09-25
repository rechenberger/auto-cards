import { streamItemCard } from '@/components/game/streamItemCard'
import { getItemByName } from '@/game/allItems'
import { TinyItemClient } from './TinyItemClient'

export const TinyItem = async ({
  name,
  count = 1,
  disableHover,
}: {
  name: string
  count?: number
  disableHover?: boolean
}) => {
  const item = await getItemByName(name)
  const action = async () => {
    'use server'
    return streamItemCard({ name })
  }
  return (
    <>
      <TinyItemClient
        item={item}
        count={count}
        action={action}
        disableHover={disableHover}
      />
    </>
  )
}
