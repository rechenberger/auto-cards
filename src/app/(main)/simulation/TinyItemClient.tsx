'use client'

import { getTagDefinition } from '@/game/tags'
import { ItemDefinition } from '@/game/zod-schema'
import { cn } from '@/lib/utils'
import { capitalCase } from 'change-case'
import { atom, useAtom } from 'jotai'
import { first } from 'lodash-es'

const itemHoverAtom = atom(null as string | null)

export const TinyItemClient = ({
  item,
  count,
}: {
  item: ItemDefinition
  count: number
}) => {
  const [hoveredItem, setHoveredItem] = useAtom(itemHoverAtom)

  const tag = getTagDefinition(first(item.tags) ?? 'default')
  let label = capitalCase(item.name)
  if (count > 1) {
    label = `${count}x ${label}`
  }
  return (
    <>
      <div
        className={cn(
          'px-1 py-0.5 rounded truncate text-sm',
          tag.bgClass,
          hoveredItem && hoveredItem !== item.name && 'opacity-50 grayscale',
          'cursor-default',
        )}
        onMouseEnter={() => {
          setHoveredItem(item.name)
        }}
        onMouseLeave={() => {
          setHoveredItem(null)
        }}
      >
        {label}
      </div>
    </>
  )
}
