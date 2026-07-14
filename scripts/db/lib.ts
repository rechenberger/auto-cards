import 'dotenv-flow/config'

import { createClient, type Client, type InValue } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { migrate } from 'drizzle-orm/libsql/migrator'
import { readMigrationFiles, type MigrationMeta } from 'drizzle-orm/migrator'
import { createHash } from 'node:crypto'
import { chmod, mkdir, mkdtemp, readFile, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, dirname, isAbsolute, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptsDirectory = dirname(fileURLToPath(import.meta.url))
export const projectRoot = resolve(scriptsDirectory, '../..')
export const migrationsFolder = resolve(projectRoot, 'drizzle')
export const localArtifactsDir = resolve(projectRoot, '.db-artifacts')

export type DatabaseTarget = {
  url: string
  authToken?: string
  localPath?: string
  label: string
}

export function hasFlag(name: string): boolean {
  return process.argv.includes(name)
}

export function readArg(name: string): string | undefined {
  const index = process.argv.indexOf(name)
  return index === -1 ? undefined : process.argv[index + 1]
}

export function getDatabaseTarget(): DatabaseTarget {
  const database = readArg('--database')
  const explicitUrl = readArg('--url')
  const configuredUrl = explicitUrl ?? process.env.DB_URL

  if (database && explicitUrl) {
    throw new Error('Use either --database or --url, not both.')
  }

  if (database) {
    const localPath = resolve(database)
    return {
      url: `file:${localPath}`,
      localPath,
      label: localPath,
    }
  }

  const url = configuredUrl ?? 'file:./db.sqlite'
  if (url.startsWith('file:')) {
    const rawPath = url.slice('file:'.length)
    const localPath = isAbsolute(rawPath) ? rawPath : resolve(rawPath)
    return {
      url: `file:${localPath}`,
      localPath,
      label: localPath,
    }
  }

  return {
    url,
    authToken: readArg('--auth-token') ?? process.env.DB_TOKEN,
    label: url.replace(/\?.*$/, ''),
  }
}

export function assertRemoteAllowed(target: DatabaseTarget): void {
  if (!target.localPath && !hasFlag('--allow-remote')) {
    throw new Error(
      `Refusing to modify remote database ${target.label}. Pass --allow-remote after verifying a clone.`,
    )
  }
}

export function connect(target: DatabaseTarget): Client {
  return createClient({
    url: target.url,
    authToken: target.authToken,
  })
}

export function getMigrations(): MigrationMeta[] {
  return readMigrationFiles({ migrationsFolder })
}

export async function migrateDatabase(client: Client): Promise<void> {
  await migrate(drizzle(client), { migrationsFolder })
}

export async function tableExists(
  client: Client,
  table: string,
): Promise<boolean> {
  const result = await client.execute({
    sql: "SELECT 1 AS present FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1",
    args: [table],
  })
  return result.rows.length === 1
}

export async function scalarNumber(
  client: Client,
  sql: string,
  args: InValue[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args })
  const value = result.rows[0]?.[0]
  if (typeof value === 'bigint') return Number(value)
  if (typeof value === 'number') return value
  if (typeof value === 'string') return Number(value)
  throw new Error(`Expected numeric scalar for: ${sql}`)
}

export async function getUserTables(client: Client): Promise<string[]> {
  const result = await client.execute(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
  )
  return result.rows.map((row) => String(row.name))
}

export async function getRowCounts(
  client: Client,
  tables?: string[],
): Promise<Record<string, number>> {
  const counts: Record<string, number> = {}
  for (const table of tables ?? (await getUserTables(client))) {
    counts[table] = await scalarNumber(
      client,
      `SELECT COUNT(*) FROM ${quoteIdentifier(table)}`,
    )
  }
  return counts
}

export type SchemaSignature = Record<
  string,
  {
    columns: Array<{
      name: string
      type: string
      notNull: number
      defaultValue: string | null
      primaryKeyPosition: number
    }>
    indexes: Array<{
      name: string
      unique: number
      columns: string[]
    }>
    foreignKeys: Array<{
      from: string
      to: string
      table: string
      onUpdate: string
      onDelete: string
    }>
  }
>

export async function getSchemaSignature(
  client: Client,
  { includeMigrationTable = false }: { includeMigrationTable?: boolean } = {},
): Promise<SchemaSignature> {
  const tables = (await getUserTables(client)).filter(
    (table) => includeMigrationTable || table !== '__drizzle_migrations',
  )
  const signature: SchemaSignature = {}

  for (const table of tables) {
    const columnsResult = await client.execute(
      `PRAGMA table_info(${quoteSqlString(table)})`,
    )
    const columns = columnsResult.rows.map((row) => ({
      name: String(row.name),
      type: String(row.type).toLowerCase(),
      notNull: Number(row.notnull),
      defaultValue: row.dflt_value === null ? null : String(row.dflt_value),
      primaryKeyPosition: Number(row.pk),
    }))

    const indexList = await client.execute(
      `PRAGMA index_list(${quoteSqlString(table)})`,
    )
    const indexes = []
    for (const row of indexList.rows) {
      // Primary-key/constraint auto-index names are SQLite implementation
      // details. Explicit indexes have origin `c` and are part of our contract.
      if (String(row.origin) !== 'c') continue
      const name = String(row.name)
      const info = await client.execute(
        `PRAGMA index_info(${quoteSqlString(name)})`,
      )
      indexes.push({
        name,
        unique: Number(row.unique),
        columns: info.rows
          .sort((a, b) => Number(a.seqno) - Number(b.seqno))
          .map((indexRow) => String(indexRow.name)),
      })
    }
    indexes.sort((a, b) => a.name.localeCompare(b.name))

    const foreignKeysResult = await client.execute(
      `PRAGMA foreign_key_list(${quoteSqlString(table)})`,
    )
    const foreignKeys = foreignKeysResult.rows
      .map((row) => ({
        from: String(row.from),
        to: String(row.to),
        table: String(row.table),
        onUpdate: String(row.on_update).toLowerCase(),
        onDelete: String(row.on_delete).toLowerCase(),
      }))
      .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))

    signature[table] = { columns, indexes, foreignKeys }
  }

  return signature
}

export function assertEqual(
  actual: unknown,
  expected: unknown,
  message: string,
): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `${message}\nExpected: ${JSON.stringify(
        expected,
        null,
        2,
      )}\nActual: ${JSON.stringify(actual, null, 2)}`,
    )
  }
}

export async function createMigrationReference(
  migrationCount?: number,
): Promise<{ client: Client; cleanup: () => Promise<void> }> {
  const directory = await mkdtemp(resolve(tmpdir(), 'auto-cards-schema-'))
  const databasePath = resolve(directory, 'reference.sqlite')
  const client = connect({
    url: `file:${databasePath}`,
    localPath: databasePath,
    label: databasePath,
  })
  const migrations = getMigrations().slice(0, migrationCount)

  for (const migration of migrations) {
    for (const statement of migration.sql) {
      await client.execute(statement)
    }
  }

  return {
    client,
    cleanup: async () => {
      client.close()
      await rm(directory, { recursive: true, force: true })
    },
  }
}

export async function markBaseline(
  client: Client,
  { apply }: { apply: boolean },
): Promise<'already-marked' | 'validated' | 'marked'> {
  const [baseline] = getMigrations()
  if (!baseline) throw new Error('No baseline migration found.')

  if (await tableExists(client, '__drizzle_migrations')) {
    const existing = await client.execute({
      sql: 'SELECT hash, created_at FROM __drizzle_migrations WHERE created_at = ?',
      args: [baseline.folderMillis],
    })
    if (existing.rows.length > 0) {
      if (String(existing.rows[0]?.hash) !== baseline.hash) {
        throw new Error('The recorded baseline timestamp has a different hash.')
      }
      return 'already-marked'
    }

    const migrationCount = await scalarNumber(
      client,
      'SELECT COUNT(*) FROM __drizzle_migrations',
    )
    if (migrationCount > 0) {
      throw new Error(
        'Migration history exists but does not contain this baseline. Refusing to rewrite history.',
      )
    }
  }

  const reference = await createMigrationReference(1)
  try {
    const expected = await getSchemaSignature(reference.client)
    const actual = await getSchemaSignature(client)
    assertEqual(
      actual,
      expected,
      'Database schema does not exactly match the accepted production baseline.',
    )
  } finally {
    await reference.cleanup()
  }

  if (!apply) return 'validated'

  await client.execute(`
    CREATE TABLE IF NOT EXISTS __drizzle_migrations (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at numeric
    )
  `)
  await client.execute({
    sql: 'INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)',
    args: [baseline.hash, baseline.folderMillis],
  })
  return 'marked'
}

export async function sha256File(path: string): Promise<string> {
  const contents = await readFile(path)
  return createHash('sha256').update(contents).digest('hex')
}

export async function ensurePrivateDirectory(path: string): Promise<void> {
  await mkdir(path, { recursive: true, mode: 0o700 })
  await chmod(path, 0o700)
}

export async function copySqliteDatabase(
  sourcePath: string,
  destinationPath: string,
): Promise<void> {
  await ensurePrivateDirectory(dirname(destinationPath))
  const source = connect({
    url: `file:${resolve(sourcePath)}`,
    localPath: resolve(sourcePath),
    label: resolve(sourcePath),
  })
  try {
    await source.execute(`VACUUM INTO ${quoteSqlString(destinationPath)}`)
  } finally {
    source.close()
  }
  await chmod(destinationPath, 0o600)
}

export async function fileManifest(path: string): Promise<{
  file: string
  bytes: number
  sha256: string
}> {
  const fileStat = await stat(path)
  return {
    file: basename(path),
    bytes: fileStat.size,
    sha256: await sha256File(path),
  }
}

export function quoteIdentifier(value: string): string {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) {
    throw new Error(`Unsafe SQLite identifier: ${value}`)
  }
  return `"${value}"`
}

export function quoteSqlString(value: string): string {
  return `'${value.replaceAll("'", "''")}'`
}

export function timestampForFile(date = new Date()): string {
  return date
    .toISOString()
    .replaceAll(':', '')
    .replaceAll('-', '')
    .replace(/\.\d{3}Z$/, 'Z')
}

export async function removeIfTemporary(
  path: string,
  keep: boolean,
): Promise<void> {
  if (!keep) await rm(path, { recursive: true, force: true })
}
