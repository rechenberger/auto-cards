import { notFoundIfNotAdmin } from '@/auth/getIsAdmin'
import { CardTitle } from '@/components/ui/card'
import { db } from '@/db/db'
import { aiImage } from '@/db/schema'
import { desc } from 'drizzle-orm'
import { Metadata } from 'next'
import Link from 'next/link'
import { Fragment } from 'react'

export const metadata: Metadata = {
  title: 'Latest Images',
}

export default async function Page() {
  await notFoundIfNotAdmin({ allowDev: true })
  const images = await db.query.aiImage.findMany({
    orderBy: desc(aiImage.updatedAt),
    limit: 100,
  })
  return (
    <>
      <div className="flex flex-row gap-2 items-center">
        <CardTitle className="flex-1">{images.length} Latest Images</CardTitle>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {images.map((image) => (
          <Fragment key={image.id}>
            <div className="flex flex-col gap-2">
              <div className="aspect-square relative">
                <Link href={image.itemId ? `/items/${image.itemId}` : '#'}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.url} alt={image.prompt} />
                  <div className="absolute bottom-4 right-4 bg-black px-2 py-1 text-white rounded-full text-sm capitalize">
                    {image.themeId}
                  </div>
                </Link>
              </div>
              {/* <div className="flex flex-row justify-center">
                {image.itemId && <TinyItem name={image.itemId} />}
              </div> */}
            </div>
          </Fragment>
        ))}
      </div>
    </>
  )
}
