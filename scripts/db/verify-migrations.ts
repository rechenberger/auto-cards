import { mkdir, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { assertHealthy, inspectHealth } from './health'
import {
  assertEqual,
  connect,
  copySqliteDatabase,
  getDatabaseTarget,
  getMigrations,
  getRowCounts,
  getSchemaSignature,
  getUserTables,
  hasFlag,
  markBaseline,
  migrateDatabase,
  scalarNumber,
  sha256File,
  tableExists,
} from './lib'

async function main() {
  const source = getDatabaseTarget()
  if (!source.localPath) {
    throw new Error('Migration verification requires a local SQLite snapshot.')
  }

  const keep = hasFlag('--keep')
  const sourceHashBefore = await sha256File(source.localPath)
  const workingDirectory = await mkdtemp(
    resolve(tmpdir(), 'auto-cards-migration-'),
  )
  const migratedPath = resolve(workingDirectory, 'prod-copy.sqlite')
  const emptyPath = resolve(workingDirectory, 'empty.sqlite')

  try {
    await copySqliteDatabase(source.localPath, migratedPath)
    const migratedClient = connect({
      url: `file:${migratedPath}`,
      localPath: migratedPath,
      label: migratedPath,
    })

    let beforeCounts: Record<string, number>
    let beforeHealth
    try {
      const tablesBefore = (await getUserTables(migratedClient)).filter(
        (table) => table !== '__drizzle_migrations',
      )
      beforeCounts = await getRowCounts(migratedClient, tablesBefore)
      beforeHealth = await inspectHealth(migratedClient)
      assertHealthy(beforeHealth, 'Before migration')

      if (!(await tableExists(migratedClient, '__drizzle_migrations'))) {
        const baselineResult = await markBaseline(migratedClient, {
          apply: true,
        })
        if (baselineResult !== 'marked') {
          throw new Error(`Expected to mark baseline, got ${baselineResult}.`)
        }
      }

      await migrateDatabase(migratedClient)
      const historyAfterFirstRun = await scalarNumber(
        migratedClient,
        'SELECT COUNT(*) FROM __drizzle_migrations',
      )
      await migrateDatabase(migratedClient)
      const historyAfterSecondRun = await scalarNumber(
        migratedClient,
        'SELECT COUNT(*) FROM __drizzle_migrations',
      )
      assertEqual(
        historyAfterSecondRun,
        historyAfterFirstRun,
        'A second migration run must be a no-op.',
      )
      assertEqual(
        historyAfterSecondRun,
        getMigrations().length,
        'Migration history is incomplete.',
      )

      const afterCounts = await getRowCounts(migratedClient)
      for (const [table, count] of Object.entries(beforeCounts)) {
        assertEqual(
          afterCounts[table],
          count,
          `Row count changed for ${table}.`,
        )
      }
      assertEqual(afterCounts.job, 0, 'The job table must start empty.')
      assertEqual(
        afterCounts.apiIdempotency,
        0,
        'The API idempotency table must start empty.',
      )
      assertEqual(
        afterCounts.apiToken,
        0,
        'The personal API token table must start empty.',
      )
      assertEqual(
        await scalarNumber(
          migratedClient,
          'SELECT COUNT(*) FROM game WHERE revision != 0',
        ),
        0,
        'Existing games must start at revision 0.',
      )

      const afterHealth = await inspectHealth(migratedClient)
      assertHealthy(afterHealth, 'After migration')
      assertEqual(
        afterHealth.foreignKeyViolations,
        beforeHealth.foreignKeyViolations,
        'Foreign-key violations changed.',
      )
      assertEqual(
        afterHealth.legacyAnomalies,
        beforeHealth.legacyAnomalies,
        'Known legacy anomaly counts changed.',
      )

      await mkdir(resolve(workingDirectory), { recursive: true })
      const emptyClient = connect({
        url: `file:${emptyPath}`,
        localPath: emptyPath,
        label: emptyPath,
      })
      try {
        await migrateDatabase(emptyClient)
        const emptyHistoryAfterFirstRun = await scalarNumber(
          emptyClient,
          'SELECT COUNT(*) FROM __drizzle_migrations',
        )
        await migrateDatabase(emptyClient)
        assertEqual(
          await scalarNumber(
            emptyClient,
            'SELECT COUNT(*) FROM __drizzle_migrations',
          ),
          emptyHistoryAfterFirstRun,
          'Empty-database migration is not repeatable.',
        )
        assertEqual(
          await getSchemaSignature(migratedClient),
          await getSchemaSignature(emptyClient),
          'Migrated production copy and fresh database have different schemas.',
        )
        assertHealthy(await inspectHealth(emptyClient), 'Fresh database')
      } finally {
        emptyClient.close()
      }

      console.log('Migration rehearsal passed.')
      console.log(`Source SHA-256: ${sourceHashBefore}`)
      console.log(`Preserved rows: ${JSON.stringify(beforeCounts)}`)
      console.log(
        `Known legacy anomalies (preserved, not treated as migration failures): ${JSON.stringify(
          beforeHealth.legacyAnomalies,
        )}`,
      )
      console.log(`Migration count: ${historyAfterSecondRun}`)
      if (keep) console.log(`Kept rehearsal databases in ${workingDirectory}`)
    } finally {
      migratedClient.close()
    }

    assertEqual(
      await sha256File(source.localPath),
      sourceHashBefore,
      'The source snapshot was modified during verification.',
    )
  } finally {
    if (!keep) await rm(workingDirectory, { recursive: true, force: true })
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
