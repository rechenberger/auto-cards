import { streamAction } from '@/super-action/action/createSuperAction'
import { revalidatePath } from 'next/cache'

export const streamRevalidatePath = (
  ...args: Parameters<typeof revalidatePath>
) => {
  return streamAction(async () => {
    'use server'
    revalidatePath(...args)
  })
}
