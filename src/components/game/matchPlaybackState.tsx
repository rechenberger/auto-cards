import { MatchLog } from '@/game/generateMatch'
import { atom } from 'jotai'

export const activeMatchLogAtom = atom<{ idx: number; log: MatchLog } | null>(
  null,
)
export const matchPlaybackSpeedAtom = atom<number>(1)
export const matchPlaybackPlayingAtom = atom<boolean>(false)
