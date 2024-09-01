'use server'

import { Changemaker } from '@/game/generateChangemakers'
import {
  streamToast,
  superAction,
} from '@/super-action/action/createSuperAction'
import { capitalCase } from 'change-case'
import { ItemCard } from './ItemCard'
import { StatDescriptionsItem } from './StatDescriptionsItem'

export const streamItemCard = async ({
  name,
  changemaker,
}: {
  name: string
  changemaker?: Changemaker
}) => {
  return superAction(async () => {
    streamToast({
      title: capitalCase(name),
      description: (
        <>
          <div className="flex flex-col gap-4 max-h-[calc(100vh-80px)] overflow-auto">
            <ItemCard name={name} size="320" />
            {changemaker && (
              <div className="bg-[#313130] text-white px-4 py-1 rounded-md">
                Necessity: {Math.round(changemaker.necessity * 100)}%
              </div>
            )}
            <StatDescriptionsItem name={name} />
          </div>
        </>
      ),
    })
  })
}
