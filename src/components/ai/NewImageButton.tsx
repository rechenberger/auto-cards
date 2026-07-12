'use client'

import { useMeta } from '@/client/api/catalog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, LoaderCircle } from 'lucide-react'
import { useAiGeneration } from './useAiGeneration'

export type GenerateAiImageProps = {
  prompt: string
  itemId?: string
  themeId?: string
  force?: boolean
}

const counts = [2, 3, 5, 10]

export const NewImageButton = ({
  prompt,
  itemId,
  themeId,
  force = true,
}: GenerateAiImageProps) => {
  const meta = useMeta()
  const generation = useAiGeneration()
  if (!meta.data?.viewer?.isAdmin) return null

  const generate = (count: number) =>
    generation.queue({
      type: 'generate',
      prompt,
      itemId,
      themeId,
      force,
      count,
    })

  return (
    <div className="flex items-stretch">
      <Button
        type="button"
        size="sm"
        className="min-h-11 rounded-r-none touch-manipulation"
        disabled={generation.running}
        onClick={() => void generate(1)}
      >
        {generation.running && (
          <LoaderCircle
            className="mr-2 size-4 animate-spin motion-reduce:animate-none"
            aria-hidden="true"
          />
        )}
        {generation.running ? 'Generating…' : 'New image'}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size="sm"
            className="min-h-11 min-w-11 rounded-l-none px-3"
            disabled={generation.running}
            aria-label="Choose number of images"
          >
            <ChevronDown className="size-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {counts.map((count) => (
            <DropdownMenuItem key={count} asChild>
              <Button
                type="button"
                variant="ghost"
                className="min-h-11 w-full justify-start"
                onClick={() => void generate(count)}
              >
                Generate {count} images
              </Button>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {generation.error && (
        <span className="sr-only" role="alert">
          {generation.error.message}
        </span>
      )}
    </div>
  )
}
