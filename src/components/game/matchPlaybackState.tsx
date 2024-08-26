import { MatchLog } from '@/game/generateMatch'
import { atomWithLocalStorage } from '@/lib/atomWithLocalStorage'
import { atom } from 'jotai'

export const activeMatchLogAtom = atom<{ idx: number; log: MatchLog } | null>(
  null,
)
export const matchPlaybackSpeedAtom = atomWithLocalStorage<number>(
  'matchPlaybackSpeed',
  1,
)
export const matchPlaybackPlayingAtom = atom<boolean>(false)
