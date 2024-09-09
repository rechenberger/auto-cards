'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Fragment } from 'react'
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs'

export const NavTabs = ({
  className,
  tabs,
}: {
  className?: string
  tabs: { name: string; href: string }[]
}) => {
  const pathname = usePathname()
  return (
    <>
      <Tabs value={pathname} className={className}>
        <TabsList>
          {tabs.map((tab) => (
            <Fragment key={tab.href}>
              <TabsTrigger value={tab.href} asChild>
                <Link href={tab.href}>{tab.name}</Link>
              </TabsTrigger>
            </Fragment>
          ))}
        </TabsList>
      </Tabs>
    </>
  )
}
