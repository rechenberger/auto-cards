import { revalidateTag } from 'next/cache'

export const revalidateAiImages = () => {
  revalidateTag('getAiImages')
  revalidateTag('getAiImage')
}
