import {
  getThemeDefinition,
  IMAGE_MODEL_PROMPT,
  PLACEHOLDER_ITEM_PROMPT,
  ThemeId,
} from '@/game/themes'
import { cn } from '@/lib/utils'
import { AiImage } from '../ai/AiImage'

export const MatchBackground = async ({
  themeIds,
  variant = 'fixed',
  autoGenerate,
}: {
  themeIds: ThemeId[]
  variant?: 'fixed' | 'inline'
  autoGenerate?: boolean
}) => {
  if (themeIds.length !== 2) return null

  const themes = await Promise.all(themeIds.map(getThemeDefinition))
  const themePrompts = themes.map((theme) =>
    theme.prompt
      .replace(PLACEHOLDER_ITEM_PROMPT, 'world')
      .replace(IMAGE_MODEL_PROMPT, ''),
  )

  const prompt = `Generate an image of two merging worlds. (Smooth Transition in the middle)

The left side:
${themePrompts[0]}
Color this side blue.

The right side:
${themePrompts[1]}
Color this side red.


Make the two world merge into each other in the middle.
Maybe a world is trying to break through the other world.
Maybe there is a trail or river connecting the two worlds.

Use Flux Schnell and make it 16:9 aspect ratio.`

  return (
    <>
      <div className={cn(variant === 'fixed' && 'fixed -z-10 inset-0')}>
        <AiImage
          prompt={prompt}
          className="w-full h-full object-cover brightness-90 bg-transparent"
          itemId={`match-bg`}
          themeId={themeIds.join('~')}
          autoGenerate={autoGenerate}
        />
        {variant === 'fixed' && (
          <div className="absolute inset-0 bg-black opacity-30"></div>
        )}
      </div>
    </>
  )
}
