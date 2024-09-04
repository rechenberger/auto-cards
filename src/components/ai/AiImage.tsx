import { ThemeId } from '@/game/themes'
import { cn } from '@/lib/utils'
import { ActionButton } from '@/super-action/button/ActionButton'
import { Suspense } from 'react'
import { generateAiImage } from './generateAiImage.action'
import { getAiImage } from './getAiImage'

export type AiImageProps = {
  prompt: string
  className?: string
  itemId?: string
  themeId?: ThemeId
}

export const AiImage = ({
  className = 'aspect-square',
  ...props
}: AiImageProps) => {
  return (
    <>
      <Suspense fallback={<div className={cn(className, 'bg-slate-600')} />}>
        <AiImageRaw className={className} {...props} />
      </Suspense>
    </>
  )
}

export const AiImageRaw = async (props: AiImageProps) => {
  const { prompt, className, itemId } = props
  const aiImage = await getAiImage(props)
  if (!aiImage) {
    return (
      <div
        className={cn(className, 'flex flex-col items-center justify-center')}
      >
        <ActionButton
          catchToast
          stopPropagation
          variant={'outline'}
          action={async () => {
            'use server'
            return generateAiImage({ ...props, force: false })
          }}
          title={prompt}
        >
          Generate
        </ActionButton>
      </div>
    )
  }
  return (
    <>
      <ActionButton
        catchToast
        variant={'outline'}
        action={async () => {
          'use server'
          return generateAiImage(props)
        }}
        title={prompt}
        command={{
          label: `Generate Image for ${itemId || prompt}`,
        }}
        hideButton
      >
        Generate
      </ActionButton>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={aiImage.url} alt={prompt} className={className} />
    </>
  )
}
