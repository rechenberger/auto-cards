export const sendDiscordMessage = async ({ content }: { content: string }) => {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  if (!webhookUrl) return
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content,
    }),
  })
  if (!response.ok) {
    throw new Error(`Discord webhook failed with status ${response.status}`)
  }
}
