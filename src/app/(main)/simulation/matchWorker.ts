import { generateMatch } from '@/game/generateMatch'

export default async function worker(data: any) {
  return await generateMatch(data)
}
