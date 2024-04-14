import { Markdown } from '@/components/demo/Markdown'
import { Card, CardContent } from '@/components/ui/card'
import { promises as fs } from 'fs'
import path from 'path'

export const Readme = async () => {
  const p = path.join(process.cwd(), '/README.md')
  const readme = await fs.readFile(p, 'utf8')
  return (
    <>
      <Card className="max-w-full py-8">
        <CardContent>
          <Markdown className="break-words">{readme}</Markdown>
        </CardContent>
      </Card>
    </>
  )
}
