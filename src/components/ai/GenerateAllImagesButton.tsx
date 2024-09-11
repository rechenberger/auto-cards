import { getIsAdmin } from '@/auth/getIsAdmin'
import { ThemeId } from '@/game/themes'
import { superAction } from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { ChevronDown, RotateCcw } from 'lucide-react'
import { Fragment } from 'react'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { generateAllImages } from './generateAllImages.action'

export const GenerateAllImagesButton = async ({
  itemId,
  themeId,
}: {
  itemId?: string
  themeId?: ThemeId
}) => {
  const isAdmin = await getIsAdmin({ allowDev: true })
  if (!isAdmin) return null

  const options = [
    {
      label: 'Fill Missing',
      itemId,
      themeId,
    },
    {
      label: 'Force Prompt',
      themeId,
      itemId,
      forcePrompt: true,
    },
    {
      label: 'Force All',
      themeId,
      itemId,
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
                      return generateAllImages(props)
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
