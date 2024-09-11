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
          { name: 'Items', href: '/docs/items' },
          { name: 'Rounds', href: '/docs/rounds' },
          { name: 'Crafting', href: '/docs/crafting' },
        ]}
      />
      {children}
    </>
  )
}
