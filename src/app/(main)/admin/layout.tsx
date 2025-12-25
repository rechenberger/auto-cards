import { NavTabs } from '@/components/layout/NavTabs'

export default function Layout({
  children,
  ...props
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <NavTabs
        className="self-center"
        tabs={[
          { name: 'Users', href: '/admin/users' },
          { name: 'Playground', href: '/admin/playground' },
          { name: 'Simulation', href: '/admin/simulation' },
          { name: 'Bot', href: '/admin/bot' },
          { name: 'AI Playtest', href: '/admin/ai-playtest' },
          { name: 'Images', href: '/admin/images' },
          { name: 'Backgrounds', href: '/admin/backgrounds' },
          { name: 'Migrations', href: '/admin/migrations' },
        ]}
      />
      {children}
    </>
  )
}
