'use client'

import { ItemDefinition } from '@/game/ItemDefinition'
import { getTagDefinition } from '@/game/tags'
import { cn } from '@/lib/utils'
import { SuperAction } from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { capitalCase } from 'change-case'
import { atom, useAtom } from 'jotai'
import { first } from 'lodash-es'

const itemHoverAtom = atom(null as string | null)

export const TinyItemClient = ({
  item,
  count,
  action,
}: {
  item: ItemDefinition
  count: number
  action?: SuperAction
}) => {
  const [hoveredItem, setHoveredItem] = useAtom(itemHoverAtom)

  const tag = getTagDefinition(first(item.tags) ?? 'default')
  let label = capitalCase(item.name)
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
          tag.bgClass,
          hoveredItem && hoveredItem !== item.name && 'opacity-50 grayscale',
        )}
        onMouseEnter={() => {
          setHoveredItem(item.name)
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
