# Auto Cards

Automatic Card Battle Game

Play Online: [auto-cards.com](https://auto-cards.com)

## Local development

```bash
pnpm install
pnpm db:push
pnpm dev
```

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
- `pnpm db:push` to push schema to DB

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

## Update Party Starter

This project was bootstrapped with [party-starter](https://github.com/rechenberger/party-starter).

You can get the latest changes from the template by running:

```bash
git remote add template https://github.com/rechenberger/party-starter.git
git fetch --all
git merge template/main --allow-unrelated-histories
```

You might have to resolve a few merge conflicts, but that's it!
