'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChevronDown } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { type KeyboardEvent, useMemo } from 'react'

const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
  if (e.key === 'Enter') {
    const focusedElement = document.activeElement as HTMLElement
    if (focusedElement?.role === 'menuitem') {
      const button = focusedElement.querySelector('button')
      if (button) {
        button.click()
      }
    }
  }
}

export const SimpleParamSelect = ({
  options,
  paramKey,
  label,
  all,
}: {
  options: { value: string; label: string }[]
  paramKey: string
  label: string
  all?: string
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const valueFromSearchParams = searchParams.get(paramKey)

  const selected = useMemo(
    () => options.find((option) => option.value === valueFromSearchParams),
    [options, valueFromSearchParams],
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="text-nowrap">
          {selected?.label ?? label}
          <ChevronDown className="size-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <ScrollArea
          className="flex flex-col max-h-[40vh]"
          onKeyDown={handleKeyDown}
        >
          {!!all && (
            <DropdownMenuItem>
              <Button
                type="button"
                className="w-full text-left"
                variant="vanilla"
                onClick={() => {
                  const newSearchParams = new URLSearchParams(
                    searchParams.toString(),
                  )
                  newSearchParams.delete(paramKey)
                  router.push(`${pathname}?${newSearchParams.toString()}`)
                }}
              >
                {all}
              </Button>
            </DropdownMenuItem>
          )}
          {options.map((option) => (
            <DropdownMenuItem key={option.value}>
              <Button
                type="button"
                variant="vanilla"
                className="w-full text-left"
                onClick={() => {
                  const newSearchParams = new URLSearchParams(
                    searchParams.toString(),
                  )
                  newSearchParams.set(paramKey, option.value)
                  router.push(`${pathname}?${newSearchParams.toString()}`)
                }}
              >
                {option.label}
              </Button>
            </DropdownMenuItem>
          ))}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
