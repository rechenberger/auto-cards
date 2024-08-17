import { getItemByName } from '@/game/allItems'
import { getTagDefinition } from '@/game/tags'
import { cn } from '@/lib/utils'
import { capitalCase } from 'change-case'
import { first } from 'lodash-es'

export const TinyItem = async ({
  name,
  count = 1,
}: {
  name: string
  count?: number
}) => {
  const item = await getItemByName(name)
  const tag = getTagDefinition(first(item.tags) ?? 'default')
  let label = capitalCase(name)
  if (count > 1) {
    label = `${count}x ${label}`
  }
  return (
    <>
      <div className={cn('px-1 py-0.5 rounded truncate text-sm', tag.bgClass)}>
        {label}
      </div>
    </>
  )
}
