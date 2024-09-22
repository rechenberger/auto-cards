import { NavTabs } from '@/components/layout/NavTabs'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavTabs
        className="self-center"
        tabs={[
          { name: 'Recent Games', href: '/watch/recent' },
          { name: 'Leaderboard', href: '/watch/leaderboard' },
        ]}
      />
      {children}
    </>
  )
}
