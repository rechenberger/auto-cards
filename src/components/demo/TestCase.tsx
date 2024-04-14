import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TeampilotCustomFunction, fetchTeampilot } from '@teampilot/sdk'
import { last } from 'lodash-es'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import { LocalDateTime } from './LocalDateTime'
import { Markdown } from './Markdown'

type TestCaseProps = {
  prompt: string
  title: string
  customFunctions?: TeampilotCustomFunction<any>[]
  launchpadSlugId?: string
}

const isDev = () => process.env.NODE_ENV === 'development'

export const TestCase = (props: TestCaseProps) => {
  const { title, prompt, customFunctions } = props
  const launchpadSlugId =
    props.launchpadSlugId ||
    process.env.TEAMPILOT_DEFAULT_LAUNCHPAD_SLUG_ID ||
    process.env.NEXT_PUBLIC_TEAMPILOT_DEFAULT_LAUNCHPAD_SLUG_ID ||
    '-'
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <div>
            <div className="font-mono text-xs">
              <span>Launchpad:&nbsp;</span>
              <Link
                href={`https://teampilot.ai/team/${
                  process.env.TEAMPILOT_TEAM_SLUG
                }/settings/launchpads/${last(launchpadSlugId.split('-'))}`}
                target="_blank"
                className="underline text-primary"
              >
                {launchpadSlugId}
              </Link>
            </div>
            <div className="font-mono text-xs">
              <span>Functions:&nbsp;</span>
              {customFunctions?.map((f) => f.nameForAI).join(', ') || '-'}
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-hidden flex flex-col gap-4">
          <div className="self-end px-4 py-2 rounded-lg rounded-tr-none bg-secondary ml-4">
            <Markdown>{prompt}</Markdown>
          </div>

          <div className="flex flex-col gap-2 self-start px-4 py-2 rounded-lg rounded-tl-none bg-secondary mr-4">
            <Suspense
              fallback={
                <>
                  <Skeleton className="h-4 w-48 bg-foreground" />
                  <Skeleton className="h-4 w-48 bg-foreground" />
                  <Skeleton className="h-4 w-48 bg-foreground" />
                </>
              }
            >
              <TestCaseResult {...props} />
            </Suspense>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

const TestCaseResult = async ({
  prompt,
  customFunctions,
  launchpadSlugId,
}: TestCaseProps) => {
  const result = await fetchTeampilot({
    message: prompt,
    accessLevel: 'LINK_WRITE',
    customFunctions,
    launchpadSlugId,
  })

  return (
    <>
      <Markdown className="">{result.message.content || ''}</Markdown>
      <div className="text-xs flex flex-row gap-2 items-center">
        {!!result.cachedAt && (
          <div className="opacity-60">
            <LocalDateTime datetime={result.cachedAt} />
          </div>
        )}
        <div className="flex-1" />
        {isDev() && (
          <Link
            href={result.chatroom?.url}
            className="hover:underline text-primary whitespace-nowrap flex flex-row items-center"
            target="_blank"
          >
            <span>Chat&nbsp;</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        )}
      </div>
    </>
  )
}
