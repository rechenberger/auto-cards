import { getMyUser } from '@/auth/getMyUser'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { getAllThemes } from '@/game/themes'
import { superAction } from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { capitalCase } from 'change-case'
import { eq } from 'drizzle-orm'
import { ChevronDown, Palette } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import { Fragment } from 'react'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { getMyUserThemeIdWithFallback } from './getMyUserThemeId'

export const ThemeSwitchButton = async () => {
  const user = await getMyUser()
  const current = await getMyUserThemeIdWithFallback()

  const disabled = !user

  const allThemes = await getAllThemes()

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={disabled}>
          <Button variant="ghost">
            <Palette className="w-4 h-4 mr-2" />
            <span>{capitalCase(current)}</span>
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {!disabled &&
            allThemes.map((theme) => (
              <Fragment key={theme.name}>
                <DropdownMenuItem asChild>
                  <ActionButton
                    variant={'ghost'}
                    hideIcon
                    className="w-full text-left"
                    size={'sm'}
                    catchToast
                    action={async () => {
                      'use server'
                      return superAction(async () => {
                        await db
                          .update(schema.users)
                          .set({ themeId: theme.name })
                          .where(eq(schema.users.id, user.id))
                        revalidatePath('/', 'layout')
                      })
                    }}
                  >
                    {capitalCase(theme.name)}
                  </ActionButton>
                </DropdownMenuItem>
              </Fragment>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
