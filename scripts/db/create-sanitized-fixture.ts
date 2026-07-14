import { chmod, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { assertHealthy, inspectHealth } from './health'
import {
  connect,
  copySqliteDatabase,
  ensurePrivateDirectory,
  fileManifest,
  getDatabaseTarget,
  getRowCounts,
  hasFlag,
  localArtifactsDir,
  markBaseline,
  migrateDatabase,
  readArg,
  sha256File,
} from './lib'

async function main() {
  const source = getDatabaseTarget()
  if (!source.localPath) {
    throw new Error('Fixture creation requires a local SQLite snapshot.')
  }

  const sourceHashBefore = await sha256File(source.localPath)
  const destination = resolve(
    readArg('--output') ??
      resolve(localArtifactsDir, 'fixtures', 'auto-cards-sanitized.sqlite'),
  )
  await ensurePrivateDirectory(dirname(destination))
  if (hasFlag('--force')) await rm(destination, { force: true })
  await copySqliteDatabase(source.localPath, destination)

  const fixture = connect({
    url: `file:${destination}`,
    localPath: destination,
    label: destination,
  })
  try {
    await markBaseline(fixture, { apply: true })
    await migrateDatabase(fixture)

    await fixture.execute('PRAGMA foreign_keys = OFF')
    const statements = [
      'DELETE FROM verificationToken',
      'DELETE FROM session',
      'DELETE FROM account',
      'DELETE FROM apiIdempotency',
      'DELETE FROM job',
      'DELETE FROM aiPlaytestStep',
      'DELETE FROM aiPlaytestRun',
      'DELETE FROM aiAgent',
      `CREATE TEMP TABLE userMap AS
        SELECT id AS oldId,
               'fixture-user-' || printf('%04d', ROW_NUMBER() OVER (ORDER BY id)) AS newId
        FROM user`,
      'UPDATE game SET userId = COALESCE((SELECT newId FROM userMap WHERE oldId = game.userId), userId)',
      'UPDATE loadout SET userId = (SELECT newId FROM userMap WHERE oldId = loadout.userId) WHERE userId IS NOT NULL AND EXISTS (SELECT 1 FROM userMap WHERE oldId = loadout.userId)',
      'UPDATE matchParticipation SET userId = (SELECT newId FROM userMap WHERE oldId = matchParticipation.userId) WHERE userId IS NOT NULL AND EXISTS (SELECT 1 FROM userMap WHERE oldId = matchParticipation.userId)',
      'UPDATE liveMatchParticipation SET userId = COALESCE((SELECT newId FROM userMap WHERE oldId = liveMatchParticipation.userId), userId)',
      'UPDATE leaderboardEntry SET userId = COALESCE((SELECT newId FROM userMap WHERE oldId = leaderboardEntry.userId), userId)',
      `UPDATE user
        SET id = (SELECT newId FROM userMap WHERE oldId = user.id),
            name = 'Player ' || substr((SELECT newId FROM userMap WHERE oldId = user.id), -4),
            email = (SELECT newId FROM userMap WHERE oldId = user.id) || '@example.invalid',
            emailVerified = NULL,
            image = NULL,
            isAdmin = 0,
            passwordHash = NULL`,
      'DROP TABLE userMap',
    ]
    for (const statement of statements) await fixture.execute(statement)
    await fixture.execute('PRAGMA foreign_keys = ON')
    await fixture.execute('VACUUM')

    const health = await inspectHealth(fixture)
    assertHealthy(health, 'Sanitized fixture')
    const manifest = {
      formatVersion: 1,
      createdAt: new Date().toISOString(),
      fixture: await fileManifest(destination),
      rowCounts: await getRowCounts(fixture),
      health,
      sanitization: [
        'removed all accounts, sessions and verification tokens',
        'removed password hashes, emails, names, avatars and admin flags',
        'replaced user ids and every managed user reference deterministically',
        'removed AI playtest traces, API idempotency responses and queued jobs',
      ],
      warning:
        'Production-derived gameplay data remains. Store as a private CI artifact unless separately approved for source control.',
    }
    const manifestPath = `${destination}.manifest.json`
    if (hasFlag('--force')) await rm(manifestPath, { force: true })
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, {
      mode: 0o600,
      flag: 'wx',
    })
    await chmod(manifestPath, 0o600)
    console.log(`Sanitized fixture: ${destination}`)
    console.log(`Manifest: ${manifestPath}`)
  } finally {
    fixture.close()
  }

  if ((await sha256File(source.localPath)) !== sourceHashBefore) {
    throw new Error(
      'The source database changed while the fixture was created.',
    )
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
