import { revalidatePath } from 'next/cache'

export const revalidateLeaderboard = () => {
  revalidatePath('/watch/leaderboard')
  revalidatePath('/watch/items')
}