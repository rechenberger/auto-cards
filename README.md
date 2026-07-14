# Auto Cards

Automatic Card Battle Game

Play Online: [auto-cards.com](https://auto-cards.com)

Auto Cards keeps Next.js App Router as its framework shell, while the game UI
is a client application backed by a versioned JSON API. Combat is deterministic:
matches persist a seed and loadout references, and the browser regenerates the
combat log locally instead of downloading it.

## Architecture

- Client Components + TanStack Query for all application pages
- Route Handlers under `/api/v1` for reads and commands
- Zod request/response contracts in `src/contracts`
- revision-based optimistic concurrency and idempotency keys for game commands
- Auth.js sessions plus scoped personal API tokens for tools and agents
- Drizzle + SQLite locally, Turso/libSQL in production
- database-backed jobs for leaderboard, simulations, bot generation, images,
  and notifications; no long-lived worker process required

The OpenAPI contract is served at `/api/openapi.json`. Personal `acp_…` tokens
can be created on `/auth/me` with separate game/live read/write scopes and an
admin scope. Raw tokens are shown once and only their SHA-256 digest is stored.
Token management and impersonation grants require a browser session; owning an
admin account does not elevate a token unless that token has the `admin` scope.

## Local development

```bash
pnpm install
pnpm db:migrate --database db.sqlite
pnpm dev
```

Full local verification:

```bash
pnpm test
pnpm ts:check
pnpm lint
pnpm build
pnpm db:check
pnpm db:verify --database db.sqlite
```

`db.sqlite` and `.db-artifacts/` are deliberately ignored. A fresh database is
created entirely from the committed migrations in `drizzle/`.

Setup your Admin User WITHOUT discord or email:

- Goto http://localhost:3000/admin/users
- Click "Create User"-Button
- Fill out form and submit
- Toggle "Admin"-Switch
- Click "Login as"-Button

## Setup for production

- Create [.env.local](.env.local)
- Generate Auth Secret
  - run `npx auth secret`
  - copy `AUTH_SECRET` to [.env.local](.env.local)
- Connect DB
  - [Create Turso Database](https://turso.tech/app/databases)
  - `DB_URL`: looks like libsql://your-app.you.turso.io
  - `DB_TOKEN`: looks like a JWT eyeyey
- Connect OAuth
  - [Create Discord Developer App](https://discord.com/developers/applications)
  - Goto OAuth2
  - `AUTH_DISCORD_ID`: Copy Client ID
  - `AUTH_DISCORD_SECRET`: Reset Secret
  - Add Redirects:
  - `http://localhost:3000/api/auth/callback/discord`
  - `https://your-app.com/api/auth/callback/discord`
- Setup Email
  - [Resend](https://resend.com/)
  - `EMAIL_FROM`: your-email@example.com
  - `AUTH_RESEND_KEY`: your resend api key
- Setup AI
  - `LAUNCHPAD_IMAGES`: [Teampilot Public Launchpad Id](https://docs.teampilot.ai/getting-started/provide-a-public-launchpad)
- Set `CRON_SECRET`; Vercel uses it for `/api/cron/jobs` and
  `/api/cron/leaderboard`.
- Rehearse and apply the committed migrations as described below. Never use
  `drizzle-kit push` against production.

`vercel.json` contains daily general-consumer and leaderboard safety schedules
that also deploy on Vercel Hobby. Route Handlers drain jobs opportunistically
with `after()`, and admin polling continues batch work, so interactive work does
not depend on a resident process. On Vercel Pro the general cron can safely be
raised to a per-minute interval if faster unattended recovery is desired.

## Database baseline and migrations

Migration `0000_baseline` represents the accepted production schema from
2026-07-12, including the three existing AI playtest tables. Migration
`0001_api_foundation` adds optimistic game revisions, the durable job queue and
API idempotency storage. `0002_live_uniqueness` protects lobby membership and
live games, `0003_api_tokens` adds personal token metadata, and
`0004_live_round_atomicity` guarantees one loadout snapshot per game round.

### Fresh local database

```bash
pnpm db:migrate --database path/to/empty.sqlite
```

### Rehearse against a production snapshot

The verification command uses `VACUUM INTO` to create a temporary copy. It
marks the baseline only on that copy, runs every migration twice, compares it
to a database built from zero, and checks integrity, JSON, row counts and known
legacy references. The input file is hash-checked before and after.

```bash
pnpm db:verify --database db.sqlite
```

Known pre-baseline anomalies are reported and must remain unchanged; they are
not silently "fixed" by schema migrations. This includes legacy missing
loadout/game references, old matches with duplicate side indices and two
orphaned live-match participations.

### Create local backup artifacts

```bash
pnpm db:snapshot --database db.sqlite
pnpm db:fixture --database db.sqlite --force
```

The first command creates an immutable, permission-restricted snapshot and a
checksum manifest in `.db-artifacts/snapshots/`. It still contains production
data and must be encrypted/access-controlled outside the repository. The
second creates a current-schema fixture with auth data, user identifiers and AI
playtest traces removed. It remains production-derived gameplay data, so keep
it as a private CI artifact unless separately reviewed.

### Adopt the baseline on an existing database

Do this once, only after `db:verify` passes on a fresh Turso clone:

```bash
# Read-only exact schema check
pnpm db:baseline --url "$DB_URL"

# Record only migration 0000 as already applied
pnpm db:baseline --url "$DB_URL" --apply --allow-remote

# Apply every forward migration after the adopted baseline
pnpm db:migrate --url "$DB_URL" --allow-remote
```

Remote writes require `--allow-remote` intentionally. Before the production
run, create a Turso clone/export and ensure point-in-time recovery is available.
Rollback means restoring/cloning the pre-migration database, not improvising a
destructive down migration.

### Schema changes

Edit `src/db/schema.ts` and its Zod contract, then generate and inspect SQL:

```bash
pnpm db:generate --name descriptive_name
pnpm db:verify --database db.sqlite
```

`pnpm db:push:local` exists only for disposable local experiments and refuses
non-`file:` URLs. Production always uses committed forward migrations.

## Libraries

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [pnpm](https://pnpm.io/)
- [shadcn/ui](https://ui.shadcn.com/)
- [@teampilot/sdk](https://sdk.teampilot.ai/)
- [drizzle](https://orm.drizzle.team/)
- [Auth.js](https://authjs.dev/)

## Update Party Starter

This project was bootstrapped with [party-starter](https://github.com/rechenberger/party-starter).

You can get the latest changes from the template by running:

```bash
git remote add template https://github.com/rechenberger/party-starter.git
git fetch --all
git merge template/main --allow-unrelated-histories
```

You might have to resolve a few merge conflicts, but that's it!
