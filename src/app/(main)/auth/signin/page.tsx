import { LoginDialog } from '@/auth/LoginDialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function Page() {
  return (
    <>
      <Card className="self-center w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <LoginDialog />
        </CardContent>
      </Card>
    </>
  )
}
