'use client'

import dynamic from 'next/dynamic'
import { ReactNode } from 'react'

const TitleScreenClient = dynamic(
  () =>
    import('./TitleScreenClient').then((module) => module.TitleScreenClient),
  { ssr: false },
)

export const TitleScreenClientDynamic = ({
  children,
}: {
  children: ReactNode[]
}) => <TitleScreenClient>{children}</TitleScreenClient>
