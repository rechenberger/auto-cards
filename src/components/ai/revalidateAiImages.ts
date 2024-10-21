import { revalidateTag } from 'next/cache'

export const revalidateAiImages = () => {
  revalidateTag('getAiImage')
  revalidateTag('getAiImages')
}
