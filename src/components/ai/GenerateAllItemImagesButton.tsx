import { getIsAdmin } from '@/auth/getIsAdmin'
import { superAction } from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { ChevronDown, RotateCcw } from 'lucide-react'
import { Fragment } from 'react'
import { getMyUserThemeIdWithFallback } from '../game/getMyUserThemeId'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { generateAllItemImages } from './generateAllItemImages.action'

export const GenerateAllItemImagesButton = async () => {
  const isAdmin = await getIsAdmin({ allowDev: true })
  if (!isAdmin) return null

  const themeId = await getMyUserThemeIdWithFallback()
  const options = [
    {
      label: 'Fill Missing',
      themeId,
    },
    {
      label: 'Force Prompt',
      themeId,
      forcePrompt: true,
    },
    {
      label: 'Force All',
      themeId,
      forceAll: true,
    },
  ]

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">
            <RotateCcw className="w-4 h-4 mr-2" />
            <span>Generate All</span>
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {options.map((props) => (
            <Fragment key={props.label}>
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
                      return generateAllItemImages(props)
                    })
                  }}
                >
                  {props.label}
                </ActionButton>
              </DropdownMenuItem>
            </Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
