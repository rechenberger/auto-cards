'use client'

import { getMatchBackgroundPrompt } from '@/game/matchBackgroundPrompt'
import { ThemeId } from '@/game/themes'
import { cn } from '@/lib/utils'
import { AiImage } from '../ai/AiImage'
import { AiImageGallery } from '../ai/AiImageGallery'

export const MatchBackground = ({
  themeIds,
  variant = 'fixed',
  showGallery,
}: {
  themeIds: ThemeId[]
  variant?: 'fixed' | 'inline'
  showGallery?: boolean
}) => {
  const [leftThemeId, rightThemeId] = themeIds
  if (!leftThemeId || !rightThemeId) return null
  const prompt = getMatchBackgroundPrompt([leftThemeId, rightThemeId])
  const combinedThemeId = `${leftThemeId}~${rightThemeId}`

  return (
    <div
      className={cn('relative', variant === 'fixed' && 'fixed -z-10 inset-0')}
    >
      <AiImage
        prompt={prompt}
        className="h-full w-full bg-transparent object-cover brightness-90"
        itemId="match-bg"
        themeId={combinedThemeId}
      />
      {variant === 'fixed' && (
        <div className="absolute inset-0 bg-black opacity-30" />
      )}
      {showGallery && (
        <AiImageGallery
          prompt={prompt}
          itemId="match-bg"
          themeId={combinedThemeId}
          tiny
          cols={4}
          limit={8}
        />
      )}
    </div>
  )
}
