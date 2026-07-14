# Auto Cards — AI Agent Notes

Always commit and push completed work unless the user explicitly says not to.

Auto Cards is a deterministic auto-battler built on Next.js App Router. The
App Router remains the framework shell, but application pages are Client
Components and all reads/mutations cross explicit JSON APIs. Do not introduce
Server Actions, `next/cache`, path revalidation, or server-rendered business
data back into the application.

## Architecture at a glance

- Next.js 15 App Router + React 19 + strict TypeScript
- Client Components + TanStack Query for application state
- Route Handlers under `/api/v1` for reads and commands
- Zod contracts in `src/contracts/`
- Application services in `src/server/application/`
- Auth.js session auth plus scoped personal API tokens
- Drizzle ORM with local SQLite or production Turso/libSQL
- Durable DB-backed jobs for leaderboard, simulations, bots, images, and
  optional notifications
- A deterministic simulator that runs on both server and browser

The root App Router layout is the unavoidable server framework shell. Leaf
pages and application layouts are client-side. Static metadata is not a reason
to move business state into RSC.

## High-signal repository map

- `src/app/(main)/`: client page entry points
- `src/app/api/v1/`: versioned JSON API Route Handlers
- `src/app/api/cron/`: protected durable-job/leaderboard consumers
- `src/client/api/`: typed fetch + React Query hooks
- `src/contracts/`: API request/response Zod schemas
- `src/features/`: game, watch, docs, and admin client views
- `src/server/api/`: error envelope, idempotency, OpenAPI helpers
- `src/server/application/`: authoritative use cases and mutations
- `src/server/auth/`: session/token principals and impersonation grants
- `src/server/jobs/`: durable queue, retries, lease recovery, processors
- `src/game/`: deterministic rules, simulation, shop/dungeon domain code
- `src/components/game/`: replay and reusable game presentation
- `src/db/`: Drizzle schema/client and persisted JSON validation
- `drizzle/`: committed forward-only migrations
- `scripts/db/`: guarded baseline, migration, snapshot, fixture, and rehearsal

`src/super-action/` no longer exists by design.

## Local development

```bash
pnpm install
pnpm db:migrate --database db.sqlite
pnpm dev
```

For a local `file:` database, set `DB_TOKEN=""` if libSQL initialization needs
the variable. `db.sqlite`, `.db-artifacts/`, `.env.local`, and generated build
artifacts are ignored and must not be committed.

Before handing off a change, run:

```bash
pnpm test
pnpm ts:check
pnpm lint
pnpm build
pnpm db:check
pnpm db:verify --database db.sqlite
```

## API mental model

All successful JSON responses use `{ "data": ... }`. Errors use:

```json
{
  "error": {
    "code": "INVALID_COMMAND",
    "message": "...",
    "requestId": "...",
    "details": {}
  }
}
```

Every response has `x-request-id`. Mutating game/live/admin command endpoints
require an `Idempotency-Key` header. Game and collector commands additionally
send `expectedRevision`; stale writes return `409 STALE_REVISION` with the
current revision.

Important endpoints:

- `GET /api/v1/meta`
- `GET /api/v1/catalog`
- `GET|POST /api/v1/games`
- `GET|DELETE /api/v1/games/:gameId`
- `POST /api/v1/games/:gameId/commands`
- `POST /api/v1/games/:gameId/collector/commands`
- `GET|POST /api/v1/live-matches`
- `GET /api/v1/live-matches/:id`
- `POST /api/v1/live-matches/:id/commands`
- `GET /api/v1/live-matches/:id/results`
- `GET /api/v1/matches/:id/replay`
- `GET /api/v1/watch/*`
- `GET|PATCH /api/v1/me`
- `GET|POST /api/v1/me/tokens`
- admin APIs under `/api/v1/admin/*` and AI images under `/api/v1/ai-images`

The complete machine-readable contract is at `GET /api/openapi.json`.

### Personal API tokens

Users create tokens on `/auth/me`. A raw token starts with `acp_`, is shown
once, and is never stored. The database stores only SHA-256, a display prefix,
scopes, expiry, usage time, and revocation state.

Scopes are:

- `game:read`
- `game:write`
- `live:read`
- `live:write`
- `admin` (effective only for real DB admins)

Pass tokens as `Authorization: Bearer acp_...`. Token management itself is
session-only so a leaked token cannot mint replacements. Never log or persist
raw token values in tests, receipts, screenshots, or fixtures.
An admin-owned token without the `admin` scope has no elevated privileges.

## Authentication and impersonation

Auth.js providers are Credentials, Discord, Resend, and Impersonate. Keep
impersonation: the admin API creates a short-lived HMAC grant, and the client
redeems it through the Auth.js impersonation provider. The target session is a
normal user session; the grant contains no reusable `AUTH_SECRET` material.
Grant creation is admin-session-only and must never accept a bearer token.

Development admin convenience still exists for interactive sessions. Personal
API tokens deliberately do not inherit dev-admin escalation.

## Gameplay and deterministic replay

`generateMatch()` in `src/game/generateMatch.ts` is the combat engine. A fixed
seed, ruleset version, item catalog, and pair of loadouts must produce the same
result. Its deterministic default does not consult wall-clock time. Server-only
runtime limits are opt-in options.

Matches intentionally persist only `{ seed }`; loadouts live in their own rows.
The replay API returns seed, loadouts, ruleset version, presentation assets, and
no combat log. `MatchReportProvider`/`MatchReplayView` rebuild logs in the
browser. Preserve this compact replay model.

Rules are version-aware:

- `src/game/gameVersion.ts` contains stable version helpers.
- `src/game/rules.ts` contains browser/server static rule constants.
- `src/game/config.ts` is the runtime environment adapter; do not import it
  from Client Components.
- Persist `version`/`gameMode` explicitly instead of trusting DB defaults.
- Leaderboards are filtered by active version, providing the seasonal soft
  reset.

Old replay outcomes may change after semantic balance patches, which is an
accepted product tradeoff. Still pass the recorded version and versioned item
catalog so compatibility is as good as the current code supports.

## Shopper commands

The authoritative flow is:

1. `GET /api/v1/games/:id` returns `GameViewDto` and `revision`.
2. The client posts a discriminated command plus `expectedRevision`.
3. `executeGameCommand()` validates owner/admin access, version, phase, live
   ready lock, and revision.
4. `mutateGame()` applies buy/reserve/reroll/sell/craft/next-round rules to a
   clone.
5. A compare-and-swap update persists revision + 1.

Fight persistence is transactional. `loadout(gameId, roundNo)` is unique, so a
round cannot be persisted twice. Selling must identify aspect variants; never
trust a client-provided price, stat, count, or item definition.

## Live Match

Live commands are `join`, `start-game`, `ready`, and `start-matches`.

- `(liveMatchId, userId)` is unique for participations and games.
- Ready atomically claims a new game revision and stores `readyRevision`.
- Game commands are rejected while participation is ready.
- Host start checks every ready revision, common round, and common ruleset.
- All loadouts, matches, participations, and ready resets for a live round are
  written in one transaction.
- Odd player counts use the deterministic ghost-opponent rule.

Do not weaken these concurrency boundaries when changing lobby UX.

## Collector / endless

Collector commands use the same game revision/idempotency boundary but their
own contract and mutation service:

- `src/contracts/collector-api.ts`
- `src/server/application/games/executeCollectorCommand.ts`
- `src/server/application/games/mutateCollectorGame.ts`
- `src/game/collector/`
- `src/features/game/collector/`

Inventory items have authoritative IDs. Favorite, equip, salvage, upgrade, and
dungeon commands must reference those IDs rather than trusting client copies.
Dungeon replay also uses the seed-only replay UI.

## Jobs and Vercel deployment

Do not recreate long-lived worker pools or fire-and-forget promises. The `job`
table is the provider-neutral queue. Jobs have unique logical keys, attempts,
backoff, lease recovery after serverless termination, completion/error state,
and retention cleanup.

Current job families cover:

- leaderboard scoring/refresh
- admin simulations
- bot-pool generation
- AI image generation
- Discord notifications

Route Handlers use Next `after()` for opportunistic draining. Admin polling
continues draining queued work. `/api/cron/jobs` is the general safety consumer
and `/api/cron/leaderboard` queues the daily refresh. The committed schedules
run once daily so they also deploy on Vercel Hobby; Pro deployments may increase
the general consumer frequency. Both require
`Authorization: Bearer $CRON_SECRET`; `vercel.json` defines schedules.

Simulation input has a 50,000 estimated-fight budget. Keep every individual job
bounded enough for the configured Vercel function duration.

Match generation runs inline inside one bounded job. `worker_threads` must not
be a production lifecycle dependency; the durable queue is the batch boundary.

## Database baseline and migrations

Canonical schema: `src/db/schema.ts`; runtime persisted-JSON schemas:
`src/db/schema-zod.ts` and domain schemas.

Migration chain:

- `0000_baseline`: accepted production schema snapshot from 2026-07-12
- `0001_api_foundation`: game revisions, durable jobs, API idempotency
- `0002_live_uniqueness`: live participation/game uniqueness
- `0003_api_tokens`: personal token storage
- `0004_live_round_atomicity`: unique game-round loadout snapshots

The local production-derived snapshot is private benchmark material. Use:

```bash
pnpm db:snapshot --database db.sqlite
pnpm db:fixture --database db.sqlite --force
pnpm db:verify --database .db-artifacts/snapshots/<snapshot>.sqlite
```

Verification copies the source with `VACUUM INTO`, checks its hash before and
after, adopts `0000` only on the copy, applies all migrations twice, builds a
fresh DB from zero, compares exact schema signatures, and preserves row counts
and known legacy anomalies.

For production:

1. Create a fresh Turso clone/export and confirm recovery.
2. `pnpm db:baseline --url "$DB_URL"` (read-only validation).
3. `pnpm db:baseline --url "$DB_URL" --apply --allow-remote` once.
4. `pnpm db:migrate --url "$DB_URL" --allow-remote`.

Never use `drizzle-kit push` against production. `db:push:local` refuses remote
URLs and is only for disposable experiments.

## Adding or changing gameplay

### Items / combat

- Definitions: `src/game/allItems.ts`
- Trigger/stat resolution: `src/game/generateMatch.ts`
- Shop eligibility: `src/game/generateShopItemsRaw.ts`
- Fast reproduction: `/admin/playground`

Add a fixed-seed regression test when changing combat semantics.

### Shop / economy

- Contract: `src/contracts/game-api.ts`
- Authoritative mutation: `src/server/application/games/mutateGame.ts`
- Command orchestration: `executeGameCommand.ts`
- Client: `src/features/game/ShopClient.tsx`
- Rounds/economy: `src/game/roundStats.ts`

Update contract, server validation, client hook/UI, OpenAPI, and tests together.

### Schema

Edit schema + runtime validation, then:

```bash
pnpm db:generate --name descriptive_name
pnpm db:check
pnpm db:verify --database db.sqlite
```

Inspect generated SQL. Never hand-wave a uniqueness migration without first
checking the production snapshot for duplicates.

## Footguns

- Replays run full logs in the browser; watch log growth and blocking CPU.
- Public DTOs must project fields explicitly. Never expose active shop seeds,
  auth records, token hashes, email addresses, or admin job payloads.
- API token auth requires passing the incoming `Request` to
  `requireApiPrincipal`/`requireApiAdmin`; otherwise only cookie sessions work.
- A mutation without an idempotency key is unsafe for agents and retries. Token
  creation is the intentional exception because storing a replayable response
  would persist the one-time raw secret.
- `DB_TOKEN=""` may be necessary for local file databases.
- Legacy orphan/reference anomalies are benchmarked, not silently repaired.
- Keep `.db-artifacts/` private; sanitized fixtures are still production-derived
  gameplay data.
