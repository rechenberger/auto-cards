import { NavTabs } from '@/components/layout/NavTabs'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavTabs
        className="self-center"
        tabs={[
          { name: 'Leaderboard', href: '/watch/leaderboard' },
          { name: 'Matches', href: '/watch/recent' },
          { name: 'Games', href: '/watch/games' },
          { name: 'Live Matches', href: '/watch/live-match' },
          { name: 'Items', href: '/watch/items' },
        ]}
      />
      {children}
    </>
  )
}
