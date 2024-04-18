import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const Home = ({
  searchParams: { redirect: redirectUrl },
}: {
  searchParams: { redirect: string }
}) => {
  return (
    <Card className="self-center w-full max-w-md flex flex-col gap-4">
      <CardContent className="flex flex-col gap-4 pt-6 items-center">
        <div>Click to complete email login</div>
        <a href={redirectUrl}>
          <Button variant="default">Continue</Button>
        </a>
      </CardContent>
    </Card>
  )
}

export default Home
