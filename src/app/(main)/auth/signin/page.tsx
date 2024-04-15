import { LoginDialog } from '@/auth/LoginDialog'
import { Card, CardContent } from '@/components/ui/card'

export default async function Page() {
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
