import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const Home = ({
  searchParams: { redirect: redirectUrl },
}: {
  searchParams: { redirect: string }
}) => {
  return (
    <Card className="self-center w-full max-w-md flex flex-col gap-4">
      <CardContent className="flex flex-col gap-4 pt-6">
        Click here to start the Party 🪩
        <a href={decodeURIComponent(redirectUrl)}>
          <Button variant="default">🕺 Let&apos;s Party Client 💃</Button>
        </a>
      </CardContent>
    </Card>
  )
}

export default Home
