import { ThemeSwitchButton } from '@/components/game/ThemeSwitchButton'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getUserName } from '@/game/getUserName'
import { ActionButton } from '@/super-action/button/ActionButton'
import { ChevronDown, KeyRound, LogOut, PersonStanding } from 'lucide-react'
import { redirect } from 'next/navigation'
import { signOut } from './auth'
import { getMyUser } from './getMyUser'
import {
  changePasswordWithRedirect,
  changeUsernameWithRedirect,
  loginWithRedirect,
} from './loginWithRedirect'
import { createAPIKey } from './createAPIKey'
import {
  streamDialog,
  superAction,
} from '@/super-action/action/createSuperAction'
import { CreateApiKeyForm } from './CreateApiKeyForm'

export const UserButton = async () => {
  // const session = await auth()
  const user = await getMyUser()

  if (!!user) {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <span>{getUserName({ user })}</span>
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {/* <DropdownMenuLabel>
              <SimpleDataCard
                data={session.user}
                classNameCell="max-w-40 overflow-hidden text-ellipsis"
              />
            </DropdownMenuLabel>
            <DropdownMenuSeparator /> */}
            <div className="w-full flex flex-col">
              <ThemeSwitchButton />
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <ActionButton
                variant={'ghost'}
                hideIcon
                className="w-full text-left"
                size={'sm'}
                action={changeUsernameWithRedirect}
              >
                <PersonStanding className="w-4 h-4 mr-2" />
                Change Username
              </ActionButton>
            </DropdownMenuItem>
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
                  return superAction(async () => {
                    streamDialog({
                      title: 'Create API Key',
                      content: <CreateApiKeyForm />,
                    })
                  })
                }}
              >
                <KeyRound className="w-4 h-4 mr-2" />
                Create API Key
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
                  const signOutResponse = await signOut({ redirect: false })
                  const url = signOutResponse.redirect
                  const response = await fetch(url)
                  if (response.ok) {
                    redirect(url)
                  } else {
                    redirect('/')
                  }
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
