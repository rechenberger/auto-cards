'use client'

import { UserButton } from '@/auth/UserButton'
import { useMe } from '@/client/api/auth'
import { useMeta } from '@/client/api/catalog'
import { DarkModeToggle } from '@/components/layout/DarkModeToggle'
import { DEFAULT_GAME_VERSION } from '@/game/gameVersion'
import { Github } from 'lucide-react'
import Link from 'next/link'
import { MusicButtonDynamic } from '../game/MusicButtonDynamic'
import { Button } from '../ui/button'
import { MainLogo } from './MainLogo'
import { MainTopNav } from './MainTopNav'

export const MainTop = () => {
  const me = useMe()
  const meta = useMeta()
  const isAuthPending = me.isPending
  const isLoggedIn = Boolean(me.data)
  const isAdminOrDev = Boolean(me.data?.isAdmin)

  const entries = [
    {
      name: isLoggedIn ? 'Game' : 'Home',
      href: isLoggedIn ? '/game' : '/',
      placeholder: isAuthPending,
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
          {meta.data && meta.data.rulesetVersion !== DEFAULT_GAME_VERSION && (
            <div className="text-sm bg-red-500/50 rounded-md px-2 py-1">
              v{meta.data.rulesetVersion}
            </div>
          )}
          <UserButton />
        </div>
        <div className="flex flex-row">
          <MusicButtonDynamic />
          <Button variant="ghost" size="icon" className="size-11" asChild>
            <Link
              href="https://github.com/rechenberger/auto-cards"
              target="_blank"
              rel="noreferrer"
              aria-label="Open Auto Cards on GitHub"
            >
              <Github aria-hidden="true" />
            </Link>
          </Button>
          <DarkModeToggle />
        </div>
      </div>
      <div className="container max-md:px-4  flex pb-6 xl:hidden items-center gap-2 flex-wrap">
        <MainTopNav entries={entries} />
        <UserButton />
      </div>
    </>
  )
}
