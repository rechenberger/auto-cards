import { getTagDefinition, Tag } from '@/game/tags'
import { cn } from '@/lib/utils'
import { capitalCase } from 'change-case'

export const TagDisplay = ({ tag }: { tag: Tag }) => {
  const def = getTagDefinition(tag)
  if (!def) return
  return (
    <span className={cn('px-1 py-0.5 rounded', def.bgClass)}>
      {capitalCase(def.name)}
    </span>
  )
}
