'use server'

import {
  streamToast,
  superAction,
} from '@/super-action/action/createSuperAction'
import { capitalCase } from 'change-case'
import { ItemCard } from './ItemCard'
import { StatDescriptionsItem } from './StatDescriptionsItem'

export const streamItemCard = async ({ name }: { name: string }) => {
  return superAction(async () => {
    streamToast({
      title: capitalCase(name),
      description: (
        <>
          <div className="flex flex-col gap-4 max-h-[calc(100vh-80px)] overflow-auto">
            <ItemCard name={name} size="320" />
            <StatDescriptionsItem name={name} />
          </div>
        </>
      ),
    })
  })
}
