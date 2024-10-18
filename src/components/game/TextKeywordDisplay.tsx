import { TinyItem } from '@/components/game/TinyItem'
import { getAllItems } from '@/game/allItems'
import { allStatsDefinition } from '@/game/stats'
import { allTagDefinitions } from '@/game/tags'
import ReactMarkdown from 'react-markdown'
import { StatDisplay } from './StatsDisplay'
import { TagDisplay } from './TagDisplay'

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

            const tag = allTagDefinitions.find((tag) => tag.name === text)
            if (tag) {
              return <TagDisplay tag={tag.name} />
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
