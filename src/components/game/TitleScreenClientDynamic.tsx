'use client'

import ErrorBoundary from '@/lib/ErrorBoundary'
import dynamic from 'next/dynamic'
import { ReactNode } from 'react'

const TitleScreenClient = dynamic(
  () => import('./TitleScreenClient').then((m) => m.TitleScreenClient),
  {
    ssr: false,
  },
)

export const TitleScreenClientDynamic = ({
  children,
}: {
  children: ReactNode[]
}) => {
  return (
    <ErrorBoundary>
      <TitleScreenClient>{children}</TitleScreenClient>
    </ErrorBoundary>
  )
}
