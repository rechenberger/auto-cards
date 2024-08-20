import { MainLogo } from '@/components/layout/MainLogo'
import { LoaderCircle } from 'lucide-react'

export default function Page() {
  return (
    <div className="bg-background flex-1 w-full flex flex-col items-center justify-center animate-pulse">
      <div className="mx-8">
        <MainLogo size="big" />
      </div>
      <LoaderCircle className="text-primary size-6 animate-spin" />
    </div>
  )
}
