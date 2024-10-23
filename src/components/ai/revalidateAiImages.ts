import { revalidateTag } from 'next/cache'

export const revalidateAiImages = () => {
  revalidateTag('aiImages')
}
