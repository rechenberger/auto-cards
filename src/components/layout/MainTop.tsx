import { UserButton } from '@/auth/UserButton'
import { getIsAdmin } from '@/auth/getIsAdmin'
import { getIsLoggedIn } from '@/auth/getMyUser'
import { DarkModeToggle } from '@/components/layout/DarkModeToggle'
import { Github } from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Button } from '../ui/button'
import { MainLogo } from './MainLogo'
import { MainTopNav } from './MainTopNav'

const MusicButton = dynamic(
  () => import('../game/MusicButton').then((mod) => mod.MusicButton),
  {
    ssr: false,
  },
)

export const MainTop = async () => {
  const isAdminOrDev = await getIsAdmin({ allowDev: true })
  const isLoggedIn = await getIsLoggedIn()

  const entries = [
    {
      name: 'Home',
      href: '/',
      hidden: isLoggedIn,
    },
    {
      name: 'Game',
      href: '/game',
      hidden: !isLoggedIn,
    },
    {
      name: 'Watch',
      href: '/watch',
    },
    {
      name: 'Docs',
      href: '/docs',
    },
    {
      name: 'Admin',
      href: '/admin',
      hidden: !isAdminOrDev,
    },
  ].filter((entry) => !entry.hidden)

  return (
    <>
      <div className="container max-md:px-4 flex flex-row items-center justify-between gap-6 py-6">
        <MainLogo />
        <div className="hidden flex-1 xl:flex items-center gap-2">
          <MainTopNav entries={entries} />
          {process.env.DB_URL?.includes('file:') && (
            <div className="text-sm bg-red-500/50 rounded-md px-2 py-1">
              Local DB
            </div>
          )}
          <UserButton />
        </div>
        <div className="flex flex-row">
          <MusicButton />
          <Button variant={'ghost'} size="icon" asChild>
            <Link
              href="https://github.com/rechenberger/auto-cards"
              target="_blank"
            >
              <Github />
            </Link>
          </Button>
          <DarkModeToggle />
        </div>
      </div>
      <div className="container max-md:px-4 flex pb-6 xl:hidden">
        <MainTopNav entries={entries} />
        <UserButton />
      </div>
    </>
  )
}
