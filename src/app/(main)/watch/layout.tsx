import { NavTabs } from '@/components/layout/NavTabs'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavTabs
        className="self-center"
        tabs={[
          { name: 'Recent', href: '/watch/recent' },
          { name: 'Live Matches', href: '/watch/live-match' },
          { name: 'Leaderboard', href: '/watch/leaderboard' },
        ]}
      />
      {children}
    </>
  )
}
