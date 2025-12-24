## Auto Cards — AI Agent Notes

Auto Cards is a **deterministic auto-battler / auto-card battle** game built with **Next.js App Router**. Players build a loadout by buying items from a shop, then run a deterministic fight simulation that can be replayed from a stored seed. There is also a **Live Match** (multiplayer lobby) mode and an **admin-only “collector/endless” dungeon mode**.

This document is meant to be a **practical map** of the codebase for future AI agents: where core logic lives, how to run it locally, and which patterns you must follow when changing gameplay/UI/data.

---

## Tech stack

- **Next.js 15** (App Router), **React 19**
- **TypeScript** (strict)
- **Tailwind CSS** + **shadcn/ui** (Radix primitives)
- **Auth.js / NextAuth v5 beta** with **Drizzle adapter**
- **Drizzle ORM** + **SQLite** (local `file:`) or **Turso/libSQL** (prod)
- **worker_threads** for parallel match simulation (optional)
- **Teampilot SDK** for AI-generated images (items + match backgrounds)

---

## Repo map (high-signal directories)

- **`src/app/`**: Next.js routes (server components by default)
  - **`src/app/(main)/game`**: “My Games” + per-game page (shop vs match view)
  - **`src/app/(main)/match/[matchId]`**: standalone match replay page
  - **`src/app/(main)/live/[liveMatchId]`**: live match lobby page
  - **`src/app/(main)/watch/*`**: public dashboards (leaderboard, items, recent matches)
  - **`src/app/(main)/admin/*`**: admin tools (users, playground, simulation, bot gen, images, backgrounds, migrations)
  - **`src/app/api/*`**: route handlers
- **`src/game/`**: **the simulation engine + game rules**
  - shop generation, fight simulation, RNG/seed helpers, dungeons, leaderboards, workers
- **`src/components/game/`**: UI for shop, match replay, loadouts, live match, etc.
- **`src/db/`**: Drizzle client + schema + zod schemas
- **`src/auth/`**: Auth.js config + helpers + credentials auth + impersonation
- **`src/super-action/`**: “server actions with streamed UI” abstraction (toasts/dialogs/redirect)
- **`public/`**: icons, PWA manifest, music

---

## Local development (fast path)

From `README.md`:

```bash
pnpm install
pnpm db:push
pnpm dev
```

### Local DB expectations (important)

- Local `.env` currently contains:
  - `DB_URL="file:./db.sqlite"`
  - `AUTH_SECRET="..."`
- **`src/db/db.ts` uses `process.env.DB_TOKEN!`**. For `file:` DB URLs, libSQL usually doesn’t need a token, but this code still passes one.
  - If local boot fails, set **`DB_TOKEN=""`** in `.env.local`.

### “Admin in dev” behavior

Many admin checks are called with `{ allowDev: true }` (see `src/auth/getIsAdmin.ts`).
That means in `NODE_ENV=development` **admin pages/actions may be accessible even if your user is not marked admin**.
In production, admin is controlled by the `user.isAdmin` DB field.

---

## Environment variables (what matters)

### Required for running locally

- **`AUTH_SECRET`**: Auth.js secret.
- **`DB_URL`**: `file:./db.sqlite` (local) or `libsql://...` (Turso).
- **`DB_TOKEN`**: required by current code path (set to `""` for local file DB).

### Auth providers (production)

- **Discord OAuth**:
  - `AUTH_DISCORD_ID`
  - `AUTH_DISCORD_SECRET`
- **Resend email login**:
  - `EMAIL_FROM`
  - `AUTH_RESEND_KEY`

### App URLs / client-visible settings

- **`NEXT_PUBLIC_BASE_URL`**: used to print/share URLs (live match share links, playground debug link in simulation warnings).
- **Dev convenience (optional)**:
  - `NEXT_PUBLIC_AUTH_DEFAULT_EMAIL`
  - `NEXT_PUBLIC_AUTH_DEFAULT_PASSWORD`

### Admin automation / integrations

- **Leaderboard cron protection**:
  - `CRON_SECRET` (used by `GET /api/cron/leaderboard` via `Authorization: Bearer ...`)
- **Discord webhook (optional)**:
  - `DISCORD_WEBHOOK_URL` (used when non-admin starts playing a new game)

### AI images (Teampilot)

- **`LAUNCHPAD_IMAGES`**: launchpad slug id used for image generation (`generateAiImage.action.ts`)
- Optional/related:
  - `TEAMPILOT_DEFAULT_LAUNCHPAD_SLUG_ID`
  - `NEXT_PUBLIC_TEAMPILOT_DEFAULT_LAUNCHPAD_SLUG_ID`
  - `TEAMPILOT_TEAM_SLUG`

---

## Core data model (DB)

Drizzle schema: **`src/db/schema.ts`**, runtime validation: **`src/db/schema-zod.ts`**.

Key tables:

- **`game`**: one row per player run
  - `data` is JSON: **`GameData`** (`src/game/GameData.ts`)
  - `gameMode`: `'shopper' | 'collector'`
  - optional `liveMatchId`
- **`loadout`**: snapshot of an item build for a round
  - `userId` is nullable: `null` loadouts are used as **bots**
- **`match`**: stores only `{ seed }` (replay is deterministic)
- **`matchParticipation`**: joins loadouts to a match with `sideIdx` and win/loss
- **`liveMatch`** + **`liveMatchParticipation`**: lobby and ready status
- **`leaderboardEntry`**: cached scores for loadouts / games
- **`aiImage`**: stored AI-generated images for item/theme prompts

---

## Gameplay architecture (how a run works)

### “Shopper” mode (main mode)

High-level flow:

1. **Create game**: `createGame()` (`src/game/createGame.ts`)
   - initializes `GameData` with seed, gold, empty loadout, shop items
2. **Shop phase**: UI is `ShopView` (`src/components/game/ShopView.tsx`)
   - player buys/reserves/rerolls; this mutates `game.data`
3. **Fight phase**: `fight()` (`src/game/fight.ts`)
   - persists:
     - a new `loadout` row (your build for this round)
     - a new `match` row (only seed)
     - 2 `matchParticipation` rows
   - enemy is selected from recent loadouts at same round (plus bots), seeded via `rngItem`
4. **Match replay**: `MatchView` uses `match.data.seed` to replay deterministically.
5. **Next round**: `NextRoundButton` increments `roundNo`, adds gold/exp, regenerates shop.

### How game mutations are done (important pattern)

Use **`gameAction()`** (`src/game/gameAction.ts`) for “mutate game state then persist”:

- loads game fresh from DB
- optional optimistic concurrency check via `checkUpdatedAt`
- executes your mutation callback on a cloned `ctx.game`
- saves via `updateGame()`
- revalidates `/game` and `/game/[id]` (streaming optional)

If you are adding/changing shop actions, round transitions, etc., **follow this pattern**.

### Deterministic combat simulator

The fight simulator is **`generateMatch()`** (`src/game/generateMatch.ts`).

Key points:

- Determinism is driven by **seed arrays** (`src/game/seed.ts`) and `seedToString()`.
- Items become “actions” via their trigger list; base tick applies regen/poison/fatigue/etc.
- Performance guardrails:
  - `MAX_MATCH_MS`, `MAX_LOGS`, `MAX_MATCH_TIME` in `src/game/config.ts`
  - if exceeded, match ends early and logs a console warning + playground reproduction URL
- For bot simulations / leaderboard scoring, `skipLogs: true` is used.

### Match replay UI

- `MatchView` is a server component, but it renders **`MatchReportProvider`** (`src/components/game/MatchReportProvider.tsx`) which is a client component that calls `generateMatch(input)` to produce logs for playback.
- This means **replays can be CPU-heavy on the client** if logs are large.

---

## Live Match (multiplayer lobby)

Core pieces:

- Join/Start game: `LiveMatchJoinButtons` (`src/components/game/LiveMatchJoinButtons.tsx`)
- Ready/Start matches: `LiveMatchGameButtons` (`src/components/game/LiveMatchGameButtons.tsx`)
- Batch fight execution: `fightLiveMatch()` (`src/game/fightLiveMatch.ts`)
  - asserts all players ready
  - saves each player’s loadout
  - pairs players (odd player count gets a seeded “ghost” opponent)
  - writes matches + participations
  - resets ready state to false

---

## “Collector” mode (endless/dungeons)

This is gated behind admin tooling in the UI.

- `GameMode = 'collector'` (see `src/game/gameMode.ts`)
- `CollectorGamePage` (`src/components/game/collector/CollectorGamePage.tsx`) selects:
  - starting options
  - dungeon match view if `game.data.dungeon` exists
  - overview otherwise
- Dungeon combat uses the same `generateMatch()` (usually `skipLogs: true`), see `fightDungeon()` (`src/components/game/collector/fightDungeon.ts`)

---

## Leaderboard + bots + simulations

### Leaderboard

- Entries are computed by **playing a candidate loadout vs the current leaderboard** and using win rate as score:
  - `addToLeaderboard()` (`src/game/addToLeaderboard.ts`)
- Public view: `src/app/(main)/watch/leaderboard/page.tsx`
- Revalidation helper: `revalidateLeaderboard()` (`src/game/revalidateLeaderboard.ts`)
- Cron endpoint: `GET /api/cron/leaderboard` (`src/app/api/cron/leaderboard/route.ts`) guarded by `CRON_SECRET`.

### Worker threads (optional)

- `generateMatchByWorker()` (`src/game/matchWorkerManager.ts`)
  - uses `worker_threads` unless `DISABLE_WORKERS === 'true'`
- Used by admin simulation (`/admin/simulation`) and bot match simulation.

### Admin simulation + bot generation

- `/admin/simulation`: explores balance by generating bots and running many matches
- `/admin/bot`: persists “best bots” as `loadout` rows with `userId = null` for enemy pool

---

## AI images + themes

- Item images and match backgrounds are generated via Teampilot and stored in `aiImage`.
- Themes live in **`src/game/themes.ts`**:
  - Each theme has a prompt template with a placeholder `[ITEM_PROMPT]`
- Item prompt is chosen in `getItemAiImagePrompt()` (`src/components/game/getItemAiImagePrompt.ts`)
- Match background merges two theme prompts in `MatchBackground` (`src/components/game/MatchBackground.tsx`)
- Admin pages:
  - `/admin/images`: browse latest images
  - `/admin/backgrounds`: gallery of match backgrounds by theme pairing

---

## Operational endpoints

- **`GET /api/status`**: simple health check (DB query with timeout)
- **`GET /api/cron/leaderboard`**: leaderboard cron job (auth via bearer token)
- **`GET /api/dev/gen`**: dev-only performance test for many generated matches

---

## Conventions & patterns (follow these)

- **Zod-first JSON**: persisted JSON columns are validated with zod (`GameData`, `LoadoutData`, etc.). Prefer updating schemas in one place and using `typedParse()` where appropriate.
- **Server actions**:
  - Many buttons use `ActionButton` + `superAction()` to stream toasts/dialogs and handle redirects.
  - If you need to mutate a `Game`, prefer `gameAction()` so persistence + revalidation are consistent.
- **Revalidation**:
  - Pages depend heavily on `revalidatePath()` calls (and `streamRevalidatePath()` for streamed actions).
- **Determinism**:
  - Any gameplay change should preserve deterministic behavior for a fixed seed, unless intentionally breaking replays.
- **Performance**:
  - Be careful when increasing log volume or match complexity; client-side replay runs `generateMatch()` with `skipLogs: false`.

---

## Where to make common changes

### Add / change an item

- Item definitions: **`src/game/allItems.ts`**
  - fields: `name`, `tags`, `price`, `rarity`, `shop`, `unique`, `stats`, `triggers`, `shopEffects`, `prompt`
- Combat effects: **`src/game/generateMatch.ts`** (how stats/triggers resolve)
- Shop availability rules: **`src/game/generateShopItemsRaw.ts`**
- Debug quickly in **`/admin/playground`** (edit a loadout + fight with a chosen seed)

### Change shop rules

- Shop generation: `generateShopItems()` + `generateShopItemsRaw()`
- UI + actions:
  - `Shop` / `ShopView` (`src/components/game/Shop*.tsx`)
  - `BuyButton`, `ReRollButton`, reserve logic

### Change round progression / economy

- Round stats table: **`src/game/roundStats.ts`**
- Next round logic: **`src/components/game/NextRoundButton.tsx`**

### Change matchmaking

- Single-player: `fight()` selects an enemy loadout from DB
- Live match: `fightLiveMatch()` pairs players and writes multiple matches

### Change DB schema

- `src/db/schema.ts` + `src/db/schema-zod.ts`
- Apply with `pnpm db:push`
- For one-off data fixes, there’s an admin “migrations” page at `/admin/migrations`

---

## Gotchas / footguns

- **Local DB token**: `DB_TOKEN` is treated as required in code; set it to `""` locally if you use `file:` DB URLs.
- **Replay stability**: matches are replayed by re-running the simulator. If you change items/stats/triggers semantics, old matches may become “Old Match” (see `MatchView` guard).
- **Client CPU**: `MatchReportProvider` computes logs on the client; keep log growth and match runtime in mind.
- **Admin allowDev**: in development, `{ allowDev: true }` effectively disables admin gating; don’t rely on it for prod behavior.

