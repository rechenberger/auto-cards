'use client'

import { ItemDefinition } from '@/game/ItemDefinition'
import { getTagDefinition } from '@/game/tags'
import { cn } from '@/lib/utils'
import { capitalCase } from 'change-case'
import { atom, useAtom } from 'jotai'
import { first } from 'lodash-es'
import Link from 'next/link'
import { ItemData } from './ItemData'

const itemHoverAtom = atom(null as string | null)

export const TinyItemClient = ({
  itemDef,
  itemData,
  disableLinks,
}: {
  itemDef: ItemDefinition
  itemData: ItemData
  disableLinks?: boolean
}) => {
  const [hoveredItem, setHoveredItem] = useAtom(itemHoverAtom)

  const count = itemData.count ?? 1
  const tag = getTagDefinition(first(itemDef.tags) ?? 'default')
  let label = capitalCase(itemDef.name)
  if (count > 1) {
    label = `${count}x ${label}`
  }
  const className = cn(
    'rounded px-1 py-0.5 text-sm truncate',
    !disableLinks &&
      'touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'bg-gray-500',
    tag.bgClass,
    hoveredItem && hoveredItem !== itemDef.name && 'opacity-50 grayscale',
  )
  const hoverProps = {
    onMouseEnter: () => setHoveredItem(itemDef.name),
    onMouseLeave: () => setHoveredItem(null),
  }

  if (disableLinks) {
    return (
      <span className={className} {...hoverProps}>
        {label}
      </span>
    )
  }

  return (
    <Link
      href={`/docs/items/${encodeURIComponent(itemDef.name)}`}
      title={capitalCase(itemDef.name)}
      aria-label={`View details for ${label}`}
      className={className}
      {...hoverProps}
    >
      {label}
    </Link>
  )
}
