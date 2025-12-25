import { Game } from '@/db/schema-zod'
import { getItemByName } from '@/game/allItems'
import { calcStats } from '@/game/calcStats'
import { NO_OF_ROUNDS } from '@/game/config'
import { AiPlaytestStepObservation } from '@/db/schema-zod'

/**
 * Build an observation of the current game state for the AI agent
 */
export async function observeGame({
  game,
  recentActions = [],
  wins = 0,
  losses = 0,
}: {
  game: Game
  recentActions?: string[]
  wins?: number
  losses?: number
}): Promise<AiPlaytestStepObservation> {
  const shopItems = await Promise.all(
    game.data.shopItems.map(async (shopItem, index) => {
      const item = await getItemByName(shopItem.name)
      const basePrice = item.price
      const effectivePrice = shopItem.isOnSale
        ? Math.ceil(basePrice * 0.5)
        : basePrice

      return {
        index,
        name: shopItem.name,
        price: basePrice,
        effectivePrice,
        isOnSale: !!shopItem.isOnSale,
        isSold: !!shopItem.isSold,
        isReserved: !!shopItem.isReserved,
        isUnique: !!item.unique,
        tags: item.tags || [],
        description: getItemDescription(item),
      }
    }),
  )

  // Calculate current loadout stats
  const loadoutStats = await calcStats({
    loadout: game.data.currentLoadout,
  })

  // Convert stats to a simple record
  const statsRecord: Record<string, number> = {}
  for (const [key, value] of Object.entries(loadoutStats)) {
    if (value !== undefined) {
      statsRecord[key] = value
    }
  }

  return {
    roundNo: game.data.roundNo,
    gold: game.data.gold,
    shopItems,
    currentLoadout: {
      items: game.data.currentLoadout.items.map((item) => ({
        name: item.name,
        count: item.count,
      })),
      stats: statsRecord,
    },
    maxRounds: NO_OF_ROUNDS,
    rerollPrice: 1, // Hardcoded for now, same as in ReRollButton
    recentActions: recentActions.slice(-5), // Keep last 5 actions for context
    wins,
    losses,
  }
}

/**
 * Get a brief description of an item for the AI
 */
function getItemDescription(item: {
  name: string
  tags?: string[]
  stats?: Record<string, number | undefined>
  triggers?: Array<{
    type: string
    cooldown?: number
    attack?: { damage?: number }
    statsSelf?: Record<string, number>
  }>
}): string {
  const parts: string[] = []

  // Add tags info
  if (item.tags?.length) {
    parts.push(`[${item.tags.join(', ')}]`)
  }

  // Add key stats
  if (item.stats) {
    const statParts: string[] = []
    if (item.stats.health) statParts.push(`+${item.stats.health} HP`)
    if (item.stats.healthMax) statParts.push(`+${item.stats.healthMax} maxHP`)
    if (item.stats.stamina) statParts.push(`+${item.stats.stamina} stamina`)
    if (item.stats.damage) statParts.push(`+${item.stats.damage} dmg`)
    if (item.stats.critChance) statParts.push(`+${item.stats.critChance}% crit`)
    if (statParts.length) parts.push(statParts.join(', '))
  }

  // Add trigger info
  if (item.triggers?.length) {
    for (const trigger of item.triggers) {
      if (trigger.attack?.damage) {
        const cooldown = trigger.cooldown
          ? `every ${trigger.cooldown / 1000}s`
          : ''
        parts.push(`attacks for ${trigger.attack.damage} dmg ${cooldown}`.trim())
      }
      if (trigger.statsSelf?.health && trigger.statsSelf.health > 0) {
        const cooldown = trigger.cooldown
          ? `every ${trigger.cooldown / 1000}s`
          : ''
        parts.push(`heals ${trigger.statsSelf.health} HP ${cooldown}`.trim())
      }
    }
  }

  return parts.join('; ') || 'No description'
}

/**
 * Format an observation as a human-readable prompt section
 */
export function formatObservationForPrompt(
  obs: AiPlaytestStepObservation,
): string {
  const lines: string[] = []

  lines.push(`## Current Game State`)
  lines.push(`- Round: ${obs.roundNo + 1} of ${obs.maxRounds}`)
  lines.push(`- Gold: ${obs.gold}`)
  lines.push(`- Record: ${obs.wins}W / ${obs.losses}L`)
  lines.push('')

  lines.push(`## Your Loadout`)
  if (obs.currentLoadout.items.length === 0) {
    lines.push('(empty)')
  } else {
    for (const item of obs.currentLoadout.items) {
      const countStr = item.count && item.count > 1 ? ` x${item.count}` : ''
      lines.push(`- ${item.name}${countStr}`)
    }
  }

  if (obs.currentLoadout.stats && Object.keys(obs.currentLoadout.stats).length) {
    lines.push('')
    lines.push(`### Stats Summary`)
    const importantStats = ['health', 'healthMax', 'stamina', 'staminaMax', 'damage', 'critChance']
    for (const stat of importantStats) {
      if (obs.currentLoadout.stats[stat]) {
        lines.push(`- ${stat}: ${obs.currentLoadout.stats[stat]}`)
      }
    }
  }

  lines.push('')
  lines.push(`## Shop (reroll costs ${obs.rerollPrice} gold)`)
  const availableItems = obs.shopItems.filter((i) => !i.isSold)
  if (availableItems.length === 0) {
    lines.push('(all items sold)')
  } else {
    for (const item of availableItems) {
      const priceStr = item.isOnSale
        ? `~~${item.price}~~ ${item.effectivePrice} (SALE!)`
        : `${item.effectivePrice}`
      const reservedStr = item.isReserved ? ' [RESERVED]' : ''
      const uniqueStr = item.isUnique ? ' [UNIQUE]' : ''
      lines.push(
        `- [${item.index}] ${item.name} - ${priceStr} gold${reservedStr}${uniqueStr}`,
      )
      if (item.description) {
        lines.push(`    ${item.description}`)
      }
    }
  }

  if (obs.recentActions?.length) {
    lines.push('')
    lines.push(`## Recent Actions`)
    for (const action of obs.recentActions) {
      lines.push(`- ${action}`)
    }
  }

  return lines.join('\n')
}

