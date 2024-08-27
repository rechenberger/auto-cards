import { MatchLog } from '@/game/generateMatch'
import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export const activeMatchLogAtom = atom<{ idx: number; log: MatchLog } | null>(
  null,
)
export const matchPlaybackSpeedAtom = atomWithStorage<number>(
  'matchPlaybackSpeed',
  1,
)
export const matchPlaybackPlayingAtom = atom<boolean>(true)
