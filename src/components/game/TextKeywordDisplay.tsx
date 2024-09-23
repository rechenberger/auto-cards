import { TinyItem } from '@/components/game/TinyItem'
import { getAllItems } from '@/game/allItems'
import { allStatsDefinition } from '@/game/stats'
import { allTagsDefinition } from '@/game/tags'
import { cn } from '@/lib/utils'
import { capitalCase } from 'change-case'
import ReactMarkdown from 'react-markdown'
import { StatDisplay } from './StatsDisplay'

export const TextKeywordDisplay = async ({
  text,
  disableTooltip,
}: {
  text: string
  disableTooltip?: boolean
}) => {
  const items = await getAllItems()
  return (
    <ReactMarkdown
      components={{
        strong: ({ children }) => (
          <strong className="text-primary">{children}</strong>
        ),
        em: ({ children }) => {
          if (typeof children === 'string') {
            const text = children

            const item = items.find((item) => item.name === text)
            if (item) {
              return <TinyItem name={item.name} />
            }

            const tag = allTagsDefinition.find((tag) => tag.name === text)
            if (tag) {
              return (
                <span className={cn('px-1 py-0.5 rounded', tag.bgClass)}>
                  {capitalCase(tag.name)}
                </span>
              )
            }

            const stat = allStatsDefinition.find((stat) => stat.name === text)
            if (stat) {
              return (
                <span>
                  <StatDisplay
                    stat={stat}
                    value={1}
                    hideCount
                    size="sm"
                    statClassName="translate-y-0.5"
                    disableTooltip={disableTooltip}
                  />
                </span>
              )
            }
          }

          return <em>{children}</em>
        },
      }}
    >
      {text}
    </ReactMarkdown>
  )
}
