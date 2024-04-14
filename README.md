## Party Starter

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

## Setup

- Create [.env.local](.env.local)
- Create DB @ [Turso](https://turso.tech/app/databases)
  - `DB_URL`: looks like libsql://your-app.you.turso.io
  - `DB_TOKEN`: looks like a JWT eyeyey
- Create App @ [Discord](https://discord.com/developers/applications)
  - Goto OAuth2
  - `AUTH_DISCORD_ID`: Copy Client ID
  - `AUTH_DISCORD_SECRET`: Reset Secret
