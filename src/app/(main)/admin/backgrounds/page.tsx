import { notFoundIfNotAdmin } from '@/auth/getIsAdmin'
import { MatchBackground } from '@/components/game/MatchBackground'
import { CardTitle } from '@/components/ui/card'
import { getAllThemes } from '@/game/themes'
import { Metadata } from 'next'
import { Fragment } from 'react'

export const metadata: Metadata = {
  title: 'Match Backgrounds',
}

export default async function Page() {
  await notFoundIfNotAdmin({ allowDev: true })
  const themes = await getAllThemes()
  return (
    <>
      <div className="flex flex-row gap-2 items-center">
        <CardTitle className="flex-1">Match Backgrounds</CardTitle>
      </div>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${themes.length + 1}, 1fr)` }}
      >
        <div>Themes</div>
        {themes.map((t1) => (
          <Fragment key={t1.name}>
            <div>{t1.name}</div>
          </Fragment>
        ))}
        {themes.map((t0) => (
          <Fragment key={t0.name}>
            <div>{t0.name}</div>
            {themes.map((t1) => (
              <Fragment key={t1.name}>
                <MatchBackground
                  themeIds={[t0.name, t1.name]}
                  variant="inline"
                />
              </Fragment>
            ))}
          </Fragment>
        ))}
      </div>
    </>
  )
}
