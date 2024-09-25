'use client'

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { omit } from 'lodash-es'
import { ReactNode, useEffect, useState } from 'react'

export type SimpleSortableItem = {
  id: UniqueIdentifier
  node: ReactNode
}

export const SimpleSortable = ({
  items,
  onOrderChange,
}: {
  items: SimpleSortableItem[]
  onOrderChange?: (items: Omit<SimpleSortableItem, 'node'>[]) => void
}) => {
  const [itemsOptimistic, setItemsOptimistic] = useState(items)

  useEffect(() => {
    setItemsOptimistic(items)
  }, [items])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={(evt) => {
        const ids = items.map((i) => i.id)
        const { active, over } = evt
        if (!active || !over) {
          return
        }
        console.log('onDragEnd', evt)
        const oldIndex = ids.indexOf(active.id)
        const newIndex = ids.indexOf(over.id)

        const newOrder = arrayMove(items, oldIndex, newIndex)
        // console.log('newOrder', newOrder)
        setItemsOptimistic(newOrder)
        onOrderChange?.(newOrder.map((item) => omit(item, ['node'])))
      }}
    >
      <SortableContext
        items={itemsOptimistic}
        strategy={verticalListSortingStrategy}
      >
        {itemsOptimistic.map((item) => (
          <SortableItem key={item.id} item={item} />
        ))}
      </SortableContext>
    </DndContext>
  )
}

const SortableItem = ({ item }: { item: SimpleSortableItem }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {item.node}
    </div>
  )
}
