import { MainTop } from '@/components/layout/MainTop'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="bg-background">
        <MainTop />
        <hr />
      </div>
      <div className="container max-md:px-4 flex flex-col gap-8 py-8 flex-1">
        {children}
      </div>
    </>
  )
}
