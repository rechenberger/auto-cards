'use client'

import { getAllItems } from '@/game/allItems'
import { allStatsDefinition } from '@/game/stats'
import { allTagDefinitions } from '@/game/tags'
import { ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import { StatDisplay } from './StatsDisplay'
import { TagDisplay } from './TagDisplay'
import { TinyItem } from './TinyItem'

const allItems = getAllItems()

export const TextKeywordDisplay = ({
  text,
  disableTooltip,
  disableLinks,
}: {
  text: string
  disableTooltip?: boolean
  disableLinks?: boolean
}) => (
  <ReactMarkdown
    components={
      {
        strong: ({ children }: { children: ReactNode }) => (
          <strong className="text-primary">{children}</strong>
        ),
        em: ({ children }: { children: ReactNode }) => {
          if (typeof children === 'string') {
            const item = allItems.find(
              (candidate) => candidate.name === children,
            )
            if (item) {
              return (
                <TinyItem
                  itemData={{ name: item.name }}
                  disableLinks={disableLinks}
                />
              )
            }

            const tag = allTagDefinitions.find(
              (candidate) => candidate.name === children,
            )
            if (tag) {
              return <TagDisplay tag={tag.name} disableLinks={disableLinks} />
            }

            const stat = allStatsDefinition.find(
              (candidate) => candidate.name === children,
            )
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
      } as never // react-markdown's component types do not model React 19 yet
    }
  >
    {text}
  </ReactMarkdown>
)
