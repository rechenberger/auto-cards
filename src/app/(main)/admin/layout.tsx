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
          { name: 'Playground', href: '/admin/playground' },
          { name: 'Simulation', href: '/admin/simulation' },
          { name: 'Bot', href: '/admin/bot' },
          { name: 'Images', href: '/admin/images' },
          { name: 'Backgrounds', href: '/admin/backgrounds' },
          { name: 'Users', href: '/admin/users' },
        ]}
      />
      {children}
    </>
  )
}
