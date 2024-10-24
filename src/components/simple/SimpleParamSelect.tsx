'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  Fragment,
  ReactNode,
  useCallback,
  useMemo,
  type KeyboardEvent,
} from 'react'

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

type SimpleParamSelectOptions = {
  options: { value: string | null; label: ReactNode }[]
  paramKey: string
  mode?: 'push' | 'replace'
  nullLabel?: ReactNode
}

const useSimpleParamSelect = ({
  options,
  paramKey,
  mode = 'push',
  nullLabel,
}: SimpleParamSelectOptions) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const valueFromSearchParams = searchParams.get(paramKey)

  const allOptions = useMemo(() => {
    if (!nullLabel) return options
    return [
      {
        value: null,
        label: nullLabel,
      },
      ...options,
    ]
  }, [options, nullLabel])

  const selected = useMemo(
    () =>
      allOptions.find(
        (option) => option.value === valueFromSearchParams ?? null,
      ),
    [allOptions, valueFromSearchParams],
  )

  const select = useCallback(
    (value: string | null) => {
      const newSearchParams = new URLSearchParams(searchParams.toString())
      if (value) {
        newSearchParams.set(paramKey, value)
      } else {
        newSearchParams.delete(paramKey)
      }
      return router[mode](`${pathname}?${newSearchParams.toString()}`)
    },
    [router, pathname, searchParams, paramKey, mode],
  )

  return { options: allOptions, selected, select }
}

type SimpleParamsStyleOptions =
  | {
      component: 'dropdown'
      label: string
      className?: string
    }
  | {
      component: 'tabs'
      className?: string
    }

export const SimpleParamSelect = (
  props: SimpleParamsStyleOptions & SimpleParamSelectOptions,
) => {
  const { options, selected, select } = useSimpleParamSelect(props)

  if (props.component === 'dropdown') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={cn('text-nowrap', props.className)}
          >
            {selected?.label ?? props.label}
            <ChevronDown className="size-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <ScrollArea
            className="flex flex-col max-h-[40vh]"
            onKeyDown={handleKeyDown}
          >
            {options.map((option, idx) => (
              <Fragment key={idx}>
                <DropdownMenuItem>
                  <Button
                    type="button"
                    variant="vanilla"
                    className="w-full text-left"
                    onClick={() => {
                      select(option.value)
                    }}
                  >
                    {option.label}
                  </Button>
                </DropdownMenuItem>
              </Fragment>
            ))}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  } else if (props.component === 'tabs') {
    return (
      <>
        <Tabs
          value={selected?.value ?? ''}
          className={props.className}
          onValueChange={(value) => {
            select(value)
          }}
        >
          <TabsList className="flex-wrap h-auto">
            {options.map((option, idx) => (
              <Fragment key={idx}>
                <TabsTrigger value={option.value ?? ''}>
                  {option.label}
                </TabsTrigger>
              </Fragment>
            ))}
          </TabsList>
        </Tabs>
      </>
    )
  } else {
    const _exhaustiveCheck: never = props
  }
}
