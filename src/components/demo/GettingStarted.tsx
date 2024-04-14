import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { fetchTeampilot } from '@teampilot/sdk'
import Link from 'next/link'

export const GettingStarted = async () => {
  if (!process.env.TEAMPILOT_DEFAULT_LAUNCHPAD_SLUG_ID) {
    throw new Error(
      `You need to set TEAMPILOT_DEFAULT_LAUNCHPAD_SLUG_ID in your .env.local file.`,
    )
  }

  const result = await fetchTeampilot({
    message:
      'Congratulate the user that they have successfully setup the Teampilot SDK Starter!',
    accessLevel: 'LINK_READ',
  })

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Lets check your setup</CardDescription>
        </CardHeader>
        <CardContent className="overflow-hidden flex flex-col">
          <div className="italic">{result.message.content}</div>
          <Link href={result.chatroom.url} className="text-primary truncate">
            {result.chatroom.url}
          </Link>
        </CardContent>
      </Card>
    </>
  )
}
