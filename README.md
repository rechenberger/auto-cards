## Teampilot Starter

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

## Setup Teampilot SDK

1. Create a Teampilot account (at [https://teampilot.ai/](https://teampilot.ai/)) if you don't have one already
2. Create a Teampilot team if you don't have one already
3. Click the top left menu and select "Launchpads"
4. Create a new Launchpad - From there you can configure the Launchpad to your needs (Not needed to get started)
5. Activate the "Public" switch
6. Click on "Save" at the bottom right of the page
7. Create a `.env.local` file in the root of the project
8. Copy the "ID" that is now visible under "Public", and paste it into the `TEAMPILOT_DEFAULT_LAUNCHPAD_SLUG_ID` variable in the `.env.local` file

And thats it - you are now ready to use the Teampilot SDK in your project.
