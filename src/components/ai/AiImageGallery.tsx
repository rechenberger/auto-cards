import { throwIfNotAdmin } from '@/auth/getIsAdmin'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { getItemByName } from '@/game/allItems'
import { cn } from '@/lib/utils'
import { ActionButton } from '@/super-action/button/ActionButton'
import { capitalCase } from 'change-case'
import { eq } from 'drizzle-orm'
import { first, orderBy } from 'lodash-es'
import { revalidatePath } from 'next/cache'
import { Fragment } from 'react'
import { ThemeSwitchButton } from '../game/ThemeSwitchButton'
import { AiImageProps } from './AiImage'
import { getAiImages } from './getAiImage'
import { NewImageButton } from './NewImageButton'

export type AiImageGalleryProps = AiImageProps & { tiny?: boolean }

export const AiImageGallery = async (props: AiImageGalleryProps) => {
  const { itemId, prompt, className, themeId, tiny } = props
  const aiImages = await getAiImages(props)

  const item = itemId ? await getItemByName(itemId) : undefined
  const subTitle = item ? item.prompt || capitalCase(item.name) : prompt

  const active = first(orderBy(aiImages, 'updatedAt', 'desc'))

  return (
    <>
      <div
        className={cn(
          'flex flex-col gap-4',
          tiny &&
            'absolute bottom-0 inset-x-0 gap-2 opacity-0 hover:opacity-100 px-3 pt-6 pb-1 rounded-b-xl bg-gradient-to-t from-black/60 to-transparent from-80% flex-col-reverse',
        )}
      >
        <div
          className={cn(
            'flex flex-row items-center gap-2',
            tiny && 'justify-center',
          )}
        >
          {!tiny && (
            <div className="flex flex-col flex-1">
              <h2 className="font-bold text-xl">AI Image Gallery</h2>
              <h3 className="opacity-60">{subTitle}</h3>
            </div>
          )}
          {!tiny && <ThemeSwitchButton />}
          <NewImageButton
            prompt={prompt}
            itemId={itemId}
            themeId={themeId}
            force={!!aiImages.length}
          />
        </div>
        <div className="grid grid-cols-3 gap-2 items-start">
          {aiImages.map((aiImage) => (
            <Fragment key={aiImage.id}>
              <ActionButton
                component="button"
                hideIcon
                className="relative"
                action={async () => {
                  'use server'
                  await throwIfNotAdmin({ allowDev: true })
                  await db
                    .update(schema.aiImage)
                    .set({
                      updatedAt: new Date().toISOString(),
                    })
                    .where(eq(schema.aiImage.id, aiImage.id))
                  revalidatePath('/', 'layout')
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={aiImage.url}
                  alt={prompt}
                  className={cn(
                    active === aiImage && 'ring-4 ring-primary',
                    className,
                  )}
                />
                {aiImage.prompt !== prompt && (
                  <div
                    className={cn(
                      'absolute top-2 right-2 bg-orange-500 text-white text-xs rounded-md',
                      tiny ? 'size-3' : 'px-2 py-1',
                    )}
                  >
                    {!tiny && <div>Old Prompt</div>}
                  </div>
                )}
              </ActionButton>
            </Fragment>
          ))}
        </div>
      </div>
    </>
  )
}
