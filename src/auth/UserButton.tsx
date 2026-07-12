'use client'

import { meQueryKey, useMe, useUpdateMe } from '@/client/api/auth'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from '@/components/ui/use-toast'
import { ThemeId, themeIds } from '@/game/themeSchema'
import { useQueryClient } from '@tanstack/react-query'
import { capitalCase } from 'change-case'
import {
  ChevronDown,
  KeyRound,
  LoaderCircle,
  LogOut,
  Palette,
  PersonStanding,
  UserRound,
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

export const UserButton = () => {
  const me = useMe()
  const updateMe = useUpdateMe()
  const queryClient = useQueryClient()
  const pathname = usePathname()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  if (me.isLoading) {
    return (
      <Button
        variant="outline"
        className="min-h-11 touch-manipulation"
        disabled
        aria-busy="true"
      >
        <LoaderCircle
          className="mr-2 size-4 animate-spin motion-reduce:animate-none"
          aria-hidden="true"
        />
        Account
      </Button>
    )
  }

  if (me.isError) {
    return (
      <Button
        type="button"
        variant="outline"
        className="min-h-11 touch-manipulation"
        onClick={() => void me.refetch()}
      >
        Retry account
      </Button>
    )
  }

  if (!me.data) {
    const redirect = pathname && pathname !== '/auth/login' ? pathname : '/'
    return (
      <Button variant="outline" className="min-h-11 touch-manipulation" asChild>
        <Link href={`/auth/login?redirect=${encodeURIComponent(redirect)}`}>
          Log in
        </Link>
      </Button>
    )
  }

  const user = me.data
  const returnPath = pathname || '/'

  const changeTheme = async (themeId: ThemeId) => {
    try {
      await updateMe.mutateAsync({ type: 'theme', themeId })
      router.refresh()
    } catch (error) {
      toast({
        title: 'Could not change theme',
        description:
          error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      })
    }
  }

  const logout = async () => {
    setIsSigningOut(true)
    try {
      await signOut({ redirect: false, redirectTo: '/' })
      queryClient.setQueryData(meQueryKey, null)
      router.push('/')
      router.refresh()
    } catch (error) {
      setIsSigningOut(false)
      toast({
        title: 'Could not log out',
        description:
          error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="min-h-11 max-w-56 touch-manipulation"
        >
          <span className="truncate">{user.displayName}</span>
          <ChevronDown className="ml-2 size-4 shrink-0" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuItem asChild className="min-h-11 touch-manipulation">
          <Link href="/auth/me">
            <UserRound className="mr-2 size-4" aria-hidden="true" />
            Account
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="min-h-11 touch-manipulation">
            <Palette className="mr-2 size-4" aria-hidden="true" />
            Theme: {capitalCase(user.themeId)}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup
              value={user.themeId}
              onValueChange={(value) => void changeTheme(ThemeId.parse(value))}
            >
              {themeIds.map((themeId) => (
                <DropdownMenuRadioItem
                  key={themeId}
                  value={themeId}
                  className="min-h-11 touch-manipulation"
                  disabled={updateMe.isPending}
                >
                  {capitalCase(themeId)}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="min-h-11 touch-manipulation">
          <Link
            href={`/auth/change-username?redirect=${encodeURIComponent(
              returnPath,
            )}`}
          >
            <PersonStanding className="mr-2 size-4" aria-hidden="true" />
            Change username
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="min-h-11 touch-manipulation">
          <Link
            href={`/auth/change-password?redirect=${encodeURIComponent(
              returnPath,
            )}`}
          >
            <KeyRound className="mr-2 size-4" aria-hidden="true" />
            Change password
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="min-h-11 touch-manipulation"
          disabled={isSigningOut}
          onSelect={() => void logout()}
        >
          {isSigningOut ? (
            <LoaderCircle
              className="mr-2 size-4 animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          ) : (
            <LogOut className="mr-2 size-4" aria-hidden="true" />
          )}
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
