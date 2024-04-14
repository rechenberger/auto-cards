import { UserButton } from '@/auth/UserButton'
import { Markdown } from '@/components/demo/Markdown'
import { Card, CardContent } from '@/components/ui/card'
import { readFileSync } from 'fs'

export default function Page() {
  const readme = readFileSync('README.md').toString()
  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center gap-4 pb-80">
        <h1 className="text-2xl lg:text-6xl">🎉 Welcome to the Party 🥳</h1>
        <UserButton />
        <Card>
          <CardContent>
            <Markdown>{readme}</Markdown>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
