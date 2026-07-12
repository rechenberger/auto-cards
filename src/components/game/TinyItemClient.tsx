'use client'

import { ItemDefinition } from '@/game/ItemDefinition'
import { getTagDefinition } from '@/game/tags'
import { cn } from '@/lib/utils'
import { capitalCase } from 'change-case'
import { atom, useAtom } from 'jotai'
import { first } from 'lodash-es'
import { ItemData } from './ItemData'

const itemHoverAtom = atom(null as string | null)

export const TinyItemClient = ({
  itemDef,
  itemData,
}: {
  itemDef: ItemDefinition
  itemData: ItemData
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
      <span
        title={capitalCase(itemDef.name)}
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
      </span>
    </>
  )
}
