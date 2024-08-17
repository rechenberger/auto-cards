import { ItemCard } from '@/components/game/ItemCard'
import { getItemByName } from '@/game/allItems'
import {
  streamToast,
  superAction,
} from '@/super-action/action/createSuperAction'
import { capitalCase } from 'change-case'
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
    return superAction(async () => {
      streamToast({
        title: capitalCase(name),
        description: (
          <>
            <ItemCard name={name} size="320" />
          </>
        ),
      })
    })
  }
  return (
    <>
      <TinyItemClient item={item} count={count} action={action} />
    </>
  )
}
