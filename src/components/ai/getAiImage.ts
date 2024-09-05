import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { nullThemeId } from '@/game/themes'
import { and, desc, eq, isNull } from 'drizzle-orm'
import { AiImageProps } from './AiImage'

type GetAiImageProps = Omit<AiImageProps, 'className'>

const where = ({ prompt, itemId, themeId }: GetAiImageProps) => {
  return itemId
    ? and(
        eq(schema.aiImage.itemId, itemId),
        themeId
          ? themeId === nullThemeId
            ? isNull(schema.aiImage.themeId)
            : eq(schema.aiImage.themeId, themeId)
          : undefined,
      )
    : eq(schema.aiImage.prompt, prompt)
}

const orderBy = desc(schema.aiImage.updatedAt)

export const getAiImage = async (props: GetAiImageProps) => {
  return await db.query.aiImage.findFirst({
    where: where(props),
    orderBy,
  })
}

export const getAiImages = async (props: GetAiImageProps) => {
  return await db.query.aiImage.findMany({
    where: where(props),
    orderBy,
  })
}
