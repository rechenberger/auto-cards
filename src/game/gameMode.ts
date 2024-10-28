import { z } from 'zod'

export const GameMode = z.enum(['shopper', 'collector'])
export type GameMode = z.infer<typeof GameMode>
export const DefaultGameMode: GameMode = 'shopper'
