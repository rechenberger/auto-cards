'use server'

import {
  streamToast,
  superAction,
} from '@/super-action/action/createSuperAction'
import { capitalCase } from 'change-case'
import { ItemCard, ItemCardProps } from './ItemCard'
import { StatDescriptionsItem } from './StatDescriptionsItem'

export const streamItemCard = async (props: ItemCardProps) => {
  return superAction(async () => {
    streamToast({
      title: capitalCase(props.name),
      description: (
        <>
          <div className="flex flex-col gap-4 max-h-[calc(100vh-80px)] overflow-x-hidden overflow-y-auto max-md:-mx-4 items-center">
            <div className="">
              <ItemCard {...props} size="320" tooltipOnClick={false} />
            </div>
            {props.changemaker && (
              <div className="bg-[#313130] text-white px-4 py-1 rounded-md">
                Necessity: {Math.round(props.changemaker.necessity * 100)}%
              </div>
            )}
            <StatDescriptionsItem name={props.name} />
          </div>
        </>
      ),
    })
  })
}
