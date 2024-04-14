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
import {
  streamDialog,
  superAction,
} from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { ChevronDown, LogOut } from 'lucide-react'
import { LoginDialog } from './LoginDialog'
import { auth, signOut } from './auth'

export const UserButton = async () => {
  const session = await auth()

  if (!!session?.user) {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <span>{session.user?.name || 'User'}</span>
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
                action={async () => {
                  'use server'
                  await signOut()
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </ActionButton>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    )
  }

  return (
    <>
      <ActionButton
        variant={'outline'}
        hideIcon
        action={async () => {
          'use server'
          return superAction(async () => {
            streamDialog({
              title: 'Sign In',
              content: <LoginDialog />,
            })
          })
        }}
      >
        Sign In
      </ActionButton>
    </>
  )
}
