import {
  DEFAULT_GAME_VERSION,
  getNumberOfRounds,
  parseGameVersion,
} from './gameVersion'

export * from './rules'
export { DEFAULT_GAME_VERSION } from './gameVersion'

/**
 * Legacy runtime adapter. Domain and engine modules must import from
 * `gameVersion.ts` / `rules.ts` and accept a version explicitly instead.
 */
export const GAME_VERSION = parseGameVersion(process.env.GAME_VERSION)
export const NO_OF_ROUNDS = getNumberOfRounds(GAME_VERSION)
