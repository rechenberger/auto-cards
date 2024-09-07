import { TinyItem } from '@/app/(main)/simulation/TinyItem'
import { getAllItems } from '@/game/allItems'
import { allStatsDefinition } from '@/game/stats'
import ReactMarkdown from 'react-markdown'
import { StatDisplay } from './StatsDisplay'

export const TextKeywordDisplay = async ({ text }: { text: string }) => {
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

            const stat = allStatsDefinition.find((stat) => stat.name === text)
            if (stat) {
              return (
                <span>
                  <StatDisplay
                    stat={stat}
                    value={1}
                    hideCount
                    size="sm"
                    statClassName=""
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
