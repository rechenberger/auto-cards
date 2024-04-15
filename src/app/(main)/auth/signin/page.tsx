import { LoginDialog } from '@/auth/LoginDialog'
import { getIsLoggedIn } from '@/auth/getMyUser'
import { Card, CardContent } from '@/components/ui/card'
import { redirect } from 'next/navigation'

export default async function Page({
  searchParams: { redirect: redirectPath },
}: {
  searchParams: { redirect?: string }
}) {
  const isLoggedIn = await getIsLoggedIn()
  console.log('isLoggedIn', isLoggedIn)
  if (isLoggedIn) {
    console.log('redirectPath', redirectPath)
    redirect(redirectPath ? decodeURIComponent(redirectPath) : '/')
  }
  return (
    <>
      <Card className="self-center w-full max-w-md flex flex-col gap-4">
        <CardContent className="flex flex-col gap-4 pt-6">
          <LoginDialog />
        </CardContent>
      </Card>
    </>
  )
}
