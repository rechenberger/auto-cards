import { ShopEffect } from '@/game/ItemDefinition'
import { Fragment } from 'react'
import { TagDisplay } from './TagDisplay'

export const ShopEffectDisplay = ({
  shopEffect,
}: {
  shopEffect: ShopEffect
}) => {
  const prefix = {
    unlock: 'Unlocks',
    boost: 'More',
    ban: 'Removes',
  }[shopEffect.type]
  const postfix = {
    unlock: 'in shop',
    boost: 'in shop',
    ban: 'from shop',
  }[shopEffect.type]
  return (
    <>
      <div className="flex flex-row gap-1 items-center flex-wrap text-center justify-center">
        <div className="text-nowrap">{prefix}</div>
        {shopEffect.tags.map((tag) => (
          <Fragment key={tag}>
            <TagDisplay tag={tag} />
          </Fragment>
        ))}
        <div className="text-nowrap">{postfix}</div>
      </div>
    </>
  )
}
