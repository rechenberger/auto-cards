import type { Client } from '@libsql/client'
import { getUserTables, quoteIdentifier, scalarNumber } from './lib'

const jsonColumns: Record<string, string[]> = {
  aiAgent: ['memory'],
  aiPlaytestRun: ['config'],
  aiPlaytestStep: ['observation', 'action', 'result'],
  apiIdempotency: ['response'],
  game: ['data'],
  job: ['payload'],
  liveMatch: ['data'],
  liveMatchParticipation: ['data'],
  loadout: ['data'],
  match: ['data'],
  matchParticipation: ['data'],
}

const anomalyQueries: Record<string, string> = {
  gameMissingUser:
    'SELECT COUNT(*) FROM game child LEFT JOIN user parent ON parent.id = child.userId WHERE parent.id IS NULL',
  gameMissingLiveMatch:
    'SELECT COUNT(*) FROM game child LEFT JOIN liveMatch parent ON parent.id = child.liveMatchId WHERE child.liveMatchId IS NOT NULL AND parent.id IS NULL',
  loadoutMissingUser:
    'SELECT COUNT(*) FROM loadout child LEFT JOIN user parent ON parent.id = child.userId WHERE child.userId IS NOT NULL AND parent.id IS NULL',
  loadoutMissingGame:
    'SELECT COUNT(*) FROM loadout child LEFT JOIN game parent ON parent.id = child.gameId WHERE child.gameId IS NOT NULL AND parent.id IS NULL',
  loadoutMissingPrimaryParticipation:
    'SELECT COUNT(*) FROM loadout child LEFT JOIN matchParticipation parent ON parent.id = child.primaryMatchParticipationId WHERE child.primaryMatchParticipationId IS NOT NULL AND parent.id IS NULL',
  matchMissingLiveMatch:
    'SELECT COUNT(*) FROM match child LEFT JOIN liveMatch parent ON parent.id = child.liveMatchId WHERE child.liveMatchId IS NOT NULL AND parent.id IS NULL',
  matchParticipationMissingMatch:
    'SELECT COUNT(*) FROM matchParticipation child LEFT JOIN match parent ON parent.id = child.matchId WHERE parent.id IS NULL',
  matchParticipationMissingLoadout:
    'SELECT COUNT(*) FROM matchParticipation child LEFT JOIN loadout parent ON parent.id = child.loadoutId WHERE parent.id IS NULL',
  matchParticipationMissingUser:
    'SELECT COUNT(*) FROM matchParticipation child LEFT JOIN user parent ON parent.id = child.userId WHERE child.userId IS NOT NULL AND parent.id IS NULL',
  matchUnexpectedSides:
    'SELECT COUNT(*) FROM (SELECT matchId FROM matchParticipation GROUP BY matchId HAVING COUNT(*) != 2 OR COUNT(DISTINCT sideIdx) != 2 OR MIN(sideIdx) != 0 OR MAX(sideIdx) != 1)',
  leaderboardMissingUser:
    'SELECT COUNT(*) FROM leaderboardEntry child LEFT JOIN user parent ON parent.id = child.userId WHERE parent.id IS NULL',
  leaderboardMissingLoadout:
    'SELECT COUNT(*) FROM leaderboardEntry child LEFT JOIN loadout parent ON parent.id = child.loadoutId WHERE parent.id IS NULL',
  leaderboardMissingGame:
    'SELECT COUNT(*) FROM leaderboardEntry child LEFT JOIN game parent ON parent.id = child.gameId WHERE child.gameId IS NOT NULL AND parent.id IS NULL',
  liveParticipationMissingLiveMatch:
    'SELECT COUNT(*) FROM liveMatchParticipation child LEFT JOIN liveMatch parent ON parent.id = child.liveMatchId WHERE parent.id IS NULL',
  liveParticipationMissingUser:
    'SELECT COUNT(*) FROM liveMatchParticipation child LEFT JOIN user parent ON parent.id = child.userId WHERE parent.id IS NULL',
}

export type DatabaseHealth = {
  integrity: string[]
  foreignKeyViolations: number
  invalidJson: Record<string, number>
  legacyAnomalies: Record<string, number>
}

export async function inspectHealth(client: Client): Promise<DatabaseHealth> {
  const tables = new Set(await getUserTables(client))
  const integrityResult = await client.execute('PRAGMA integrity_check')
  const integrity = integrityResult.rows.map((row) => String(row[0]))

  const foreignKeyResult = await client.execute('PRAGMA foreign_key_check')
  const invalidJson: Record<string, number> = {}
  for (const [table, columns] of Object.entries(jsonColumns)) {
    if (!tables.has(table)) continue
    for (const column of columns) {
      invalidJson[`${table}.${column}`] = await scalarNumber(
        client,
        `SELECT COUNT(*) FROM ${quoteIdentifier(table)} WHERE ${quoteIdentifier(
          column,
        )} IS NOT NULL AND json_valid(${quoteIdentifier(column)}) = 0`,
      )
    }
  }

  const legacyAnomalies: Record<string, number> = {}
  const hasBaselineTables = tables.has('game') && tables.has('loadout')
  if (hasBaselineTables) {
    for (const [name, sql] of Object.entries(anomalyQueries)) {
      legacyAnomalies[name] = await scalarNumber(client, sql)
    }
  }

  return {
    integrity,
    foreignKeyViolations: foreignKeyResult.rows.length,
    invalidJson,
    legacyAnomalies,
  }
}

export function assertHealthy(health: DatabaseHealth, context: string): void {
  if (health.integrity.length !== 1 || health.integrity[0] !== 'ok') {
    throw new Error(
      `${context}: integrity_check failed: ${health.integrity.join(', ')}`,
    )
  }
  const invalid = Object.entries(health.invalidJson).filter(
    ([, count]) => count > 0,
  )
  if (invalid.length > 0) {
    throw new Error(
      `${context}: invalid JSON: ${JSON.stringify(
        Object.fromEntries(invalid),
      )}`,
    )
  }
}
