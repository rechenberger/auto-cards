'use client'

import { ItemDefinition } from '@/game/ItemDefinition'
import { getTagDefinition } from '@/game/tags'
import { cn } from '@/lib/utils'
import { SuperAction } from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { capitalCase } from 'change-case'
import { atom, useAtom } from 'jotai'
import { first } from 'lodash-es'
import { ItemData } from './ItemData'

const itemHoverAtom = atom(null as string | null)

export const TinyItemClient = ({
  itemDef,
  itemData,
  action,
}: {
  itemDef: ItemDefinition
  itemData: ItemData
  action?: SuperAction<void, unknown>
}) => {
  const [hoveredItem, setHoveredItem] = useAtom(itemHoverAtom)

  const count = itemData.count ?? 1
  const tag = getTagDefinition(first(itemDef.tags) ?? 'default')
  let label = capitalCase(itemDef.name)
  if (count > 1) {
    label = `${count}x ${label}`
  }
  return (
    <>
      <ActionButton
        action={action ?? (async () => {})}
        hideIcon
        variant="vanilla"
        size="vanilla"
        className={cn(
          'px-1 py-0.5 rounded truncate text-sm',
          'bg-gray-500',
          tag.bgClass,
          hoveredItem && hoveredItem !== itemDef.name && 'opacity-50 grayscale',
        )}
        onMouseEnter={() => {
          setHoveredItem(itemDef.name)
        }}
        onMouseLeave={() => {
          setHoveredItem(null)
        }}
      >
        {label}
      </ActionButton>
    </>
  )
}
