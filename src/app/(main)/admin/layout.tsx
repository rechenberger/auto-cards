'use client'

import { useMe } from '@/client/api/auth'
import { QueryError, QueryLoading } from '@/components/api/QueryState'
import { NavTabs } from '@/components/layout/NavTabs'

export default function Layout({ children }: { children: React.ReactNode }) {
  const me = useMe()

  if (me.isPending) {
    return <QueryLoading label="Checking admin access…" />
  }
  if (me.error) {
    return <QueryError error={me.error} retry={() => void me.refetch()} />
  }
  if (!me.data?.isAdmin) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center">
        <h1 className="text-xl font-bold">Page not found</h1>
        <p className="text-sm text-muted-foreground">
          The requested page could not be found.
        </p>
      </div>
    )
  }

  return (
    <>
      <NavTabs
        className="self-center"
        tabs={[
          { name: 'Users', href: '/admin/users' },
          { name: 'Playground', href: '/admin/playground' },
          { name: 'Simulation', href: '/admin/simulation' },
          { name: 'Bot', href: '/admin/bot' },
          { name: 'Images', href: '/admin/images' },
          { name: 'Backgrounds', href: '/admin/backgrounds' },
          { name: 'Migrations', href: '/admin/migrations' },
        ]}
      />
      {children}
    </>
  )
}
