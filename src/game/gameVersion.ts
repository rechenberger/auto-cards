export const DEFAULT_GAME_VERSION = 3

export type GameVersion = number

export const parseGameVersion = (
  value: string | number | null | undefined,
  fallback: GameVersion = DEFAULT_GAME_VERSION,
): GameVersion => {
  if (typeof value === 'number') {
    return Number.isInteger(value) && value > 0 ? value : fallback
  }

  if (!value) return fallback

  const parsed = Number.parseInt(value, 10)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

export const getNumberOfRounds = (gameVersion: GameVersion) =>
  gameVersion >= 2 ? 10 : 5
