import { z } from 'zod'

export const allDungeonNames = ['trainingGrounds', 'adventureTrail'] as const
export const DungeonName = z.enum(allDungeonNames)
export type DungeonName = z.infer<typeof DungeonName>
