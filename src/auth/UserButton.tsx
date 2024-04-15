import { SimpleDataCard } from '@/components/simple/SimpleDataCard'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ActionButton } from '@/super-action/button/ActionButton'
import { ChevronDown, KeyRound, LogOut } from 'lucide-react'
import { auth, signOut } from './auth'
import {
  changePasswordWithRedirect,
  loginWithRedirect,
} from './loginWithRedirect'

export const UserButton = async () => {
  const session = await auth()

  if (!!session?.user) {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <span>{session.user?.name ?? session.user?.email ?? 'You'}</span>
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>
              <SimpleDataCard
                data={session.user}
                classNameCell="max-w-40 overflow-hidden text-ellipsis"
              />
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <ActionButton
                variant={'ghost'}
                hideIcon
                className="w-full text-left"
                size={'sm'}
                action={changePasswordWithRedirect}
              >
                <KeyRound className="w-4 h-4 mr-2" />
                Change Password
              </ActionButton>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <ActionButton
                variant={'ghost'}
                hideIcon
                className="w-full text-left"
                size={'sm'}
                action={async () => {
                  'use server'
                  await signOut()
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </ActionButton>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    )
  }

  return (
    <>
      <ActionButton variant={'outline'} hideIcon action={loginWithRedirect}>
        Login
      </ActionButton>
    </>
  )
}
