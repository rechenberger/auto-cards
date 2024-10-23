import { getTagDefinition, Tag } from '@/game/tags'
import { cn } from '@/lib/utils'
import { capitalCase } from 'change-case'
import Link from 'next/link'

export const TagDisplay = ({
  tag,
  disableLinks,
}: {
  tag: Tag
  disableLinks?: boolean
}) => {
  const def = getTagDefinition(tag)
  if (!def) return null
  const inner = (
    <span className={cn('px-1 py-0.5 rounded', def.bgClass)}>
      {capitalCase(def.name)}
    </span>
  )
  if (!disableLinks) {
    return (
      <Link href={`/docs/items?tag=${tag}`} target="_blank">
        {inner}
      </Link>
    )
  }
  return inner
}
