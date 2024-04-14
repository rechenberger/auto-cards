# Party Starter

## Features

- The basics you love with [Next.js](https://nextjs.org/), [Tailwind CSS](https://tailwindcss.com/) and [shadcn/ui](https://ui.shadcn.com/)
- Quick Setup with [Auth.js](https://authjs.dev/), [drizzle](https://orm.drizzle.team/) and [Turso](https://turso.tech/)
- Powerful Server-Actions with
  - ActionButton
  - CMD-K Menu
  - Keyboard-Shortcuts
  - streamToast()
  - streamDialog()

## Setup

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
- `pnpm db:push` to push schema to DB

## Run

```bash
pnpm install
pnpm dev
```

## Libraries

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [pnpm](https://pnpm.io/)
- [shadcn/ui](https://ui.shadcn.com/)
- [@teampilot/sdk](https://sdk.teampilot.ai/)
- [drizzle](https://orm.drizzle.team/)
- [Auth.js](https://authjs.dev/)
- [@sodefa/next-server-context](https://github.com/rechenberger/next-server-context)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
