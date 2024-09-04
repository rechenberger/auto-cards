import { ActionButton } from '@/super-action/button/ActionButton'
import { generateAiImage, GenerateAiImageProps } from './generateAiImage.action'

export const NewImageButton = (props: GenerateAiImageProps) => {
  return (
    <>
      <ActionButton
        action={async () => {
          'use server'
          return generateAiImage({
            ...props,
          })
        }}
      >
        New Image
      </ActionButton>
    </>
  )
}
