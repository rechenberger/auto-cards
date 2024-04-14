import { MainTop } from '@/components/layout/MainTop'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MainTop />
      <hr />
      <div className="container flex flex-col gap-8 py-8 flex-1">
        {children}
      </div>
    </>
  )
}
