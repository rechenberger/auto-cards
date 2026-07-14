'use client'

import { useMeta } from '@/client/api/catalog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ItemName } from '@/game/allItems'
import { ThemeId } from '@/game/themes'
import { ChevronDown, LoaderCircle, RotateCcw } from 'lucide-react'
import { useAiGeneration } from './useAiGeneration'

export const GenerateAllImagesButton = ({
  itemId,
  themeId,
}: {
  itemId?: string
  themeId?: ThemeId
}) => {
  const meta = useMeta()
  const generation = useAiGeneration()
  if (!meta.data?.viewer?.isAdmin) return null

  const generate = (mode: 'missing' | 'prompt' | 'all') =>
    generation.queue({
      type: 'generate-batch',
      itemId: itemId as ItemName | undefined,
      themeId,
      mode,
    })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="min-h-11 touch-manipulation"
          disabled={generation.running}
        >
          {generation.running ? (
            <LoaderCircle
              className="mr-2 size-4 animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          ) : (
            <RotateCcw className="mr-2 size-4" aria-hidden="true" />
          )}
          <span>{generation.running ? 'Generating…' : 'Generate images'}</span>
          <ChevronDown className="ml-2 size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Button
            type="button"
            variant="ghost"
            className="min-h-11 w-full justify-start"
            onClick={() => void generate('missing')}
          >
            Fill missing
          </Button>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Button
            type="button"
            variant="ghost"
            className="min-h-11 w-full justify-start"
            onClick={() => void generate('prompt')}
          >
            Refresh changed prompts
          </Button>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Button
            type="button"
            variant="ghost"
            className="min-h-11 w-full justify-start"
            onClick={() => void generate('all')}
          >
            Regenerate all
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
