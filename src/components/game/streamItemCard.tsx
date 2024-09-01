'use server'

import {
  streamToast,
  superAction,
} from '@/super-action/action/createSuperAction'
import { capitalCase } from 'change-case'
import { ItemCard } from './ItemCard'

export const streamItemCard = async ({ name }: { name: string }) => {
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
