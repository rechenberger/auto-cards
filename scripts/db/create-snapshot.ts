import { createHash } from 'node:crypto'
import { chmod, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { assertHealthy, inspectHealth } from './health'
import {
  connect,
  copySqliteDatabase,
  ensurePrivateDirectory,
  fileManifest,
  getDatabaseTarget,
  getRowCounts,
  getSchemaSignature,
  localArtifactsDir,
  readArg,
  sha256File,
  timestampForFile,
} from './lib'

async function main() {
  const source = getDatabaseTarget()
  if (!source.localPath) {
    throw new Error(
      'Snapshot creation expects a local SQLite export. Export or clone Turso first.',
    )
  }

  const sourceHashBefore = await sha256File(source.localPath)
  const destination = resolve(
    readArg('--output') ??
      resolve(
        localArtifactsDir,
        'snapshots',
        `auto-cards-${timestampForFile()}.sqlite`,
      ),
  )
  await ensurePrivateDirectory(dirname(destination))
  await copySqliteDatabase(source.localPath, destination)

  const snapshot = connect({
    url: `file:${destination}`,
    localPath: destination,
    label: destination,
  })
  try {
    const health = await inspectHealth(snapshot)
    assertHealthy(health, 'Snapshot')
    const schema = await getSchemaSignature(snapshot)
    const manifest = {
      formatVersion: 1,
      createdAt: new Date().toISOString(),
      source: 'local production export (path intentionally omitted)',
      sourceSha256: sourceHashBefore,
      snapshot: await fileManifest(destination),
      schemaSha256: createHash('sha256')
        .update(JSON.stringify(schema))
        .digest('hex'),
      rowCounts: await getRowCounts(snapshot),
      health,
      handling:
        'Contains production-derived data. Keep encrypted/access-controlled and never commit.',
    }
    const manifestPath = `${destination}.manifest.json`
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, {
      mode: 0o600,
      flag: 'wx',
    })
    await chmod(manifestPath, 0o600)
    console.log(`Immutable snapshot: ${destination}`)
    console.log(`Manifest: ${manifestPath}`)
    console.log(`SHA-256: ${manifest.snapshot.sha256}`)
  } finally {
    snapshot.close()
  }

  if ((await sha256File(source.localPath)) !== sourceHashBefore) {
    throw new Error(
      'The source database changed while the snapshot was created.',
    )
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
