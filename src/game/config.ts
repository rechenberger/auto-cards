export const NEXT_PHASE = process.env.NEXT_PHASE === 'true'

export const GAME_VERSION = 1
export const NO_OF_SHOP_ITEMS = 5
export const SALE_CHANCE = 0.2
export const BASE_TICK_TIME = 1000
export const MAX_MATCH_TIME = 10 * 60 * 1000
export const BATTLE_CLOCK_TICK_MS = 100

export const FATIGUE_STARTS_AT = 15_000
export const MIN_COOLDOWN = 100
export const COOLDOWN_PRECISION = 100
export const NO_OF_ROUNDS = NEXT_PHASE ? 10 : 5
export const NO_OF_LATEST_LOADOUTS = 20
export const LIMIT_GAME_OVERVIEW = 9

export const IGNORE_SPACE = true
export const MATCH_CARD_ANIMATION_DURATION = 1_000

export const MAX_THORNS_MULTIPLIER = 1.5
export const CRIT_MULTIPLIER = 2

export const WORKER_COUNT = 8
export const WORKER_MAX_LISTENERS = 100

export const LEADERBOARD_LIMIT = 50
export const LEADERBOARD_TYPE = 'rollingTop'

export const GREAT_WIN_RATE = 2
