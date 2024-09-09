import { superAction } from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { range } from 'lodash-es'
import { ChevronDown } from 'lucide-react'
import { Fragment } from 'react'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { generateAiImage, GenerateAiImageProps } from './generateAiImage.action'

const numbers = [2, 3, 5, 10]

export const NewImageButton = (props: GenerateAiImageProps) => {
  return (
    <>
      <div className="flex flex-row gap-1">
        <ActionButton
          className="rounded-r-none"
          catchToast
          hideIcon
          size="sm"
          action={async () => {
            'use server'
            return generateAiImage({
              ...props,
            })
          }}
        >
          New Image
        </ActionButton>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size={'sm'} className="rounded-l-none">
              <ChevronDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {numbers.map((number) => (
              <Fragment key={number}>
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
                        await Promise.all(
                          range(number).map(() =>
                            generateAiImage({
                              ...props,
                            }),
                          ),
                        )
                      })
                    }}
                  >
                    {number} images
                  </ActionButton>
                </DropdownMenuItem>
              </Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  )
}
