import { MatchLog } from '@/game/generateMatch'
import { atom } from 'jotai'

export const activeMatchLogAtom = atom<MatchLog | null>(null)
