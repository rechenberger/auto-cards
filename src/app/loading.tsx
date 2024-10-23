import Image from 'next/image'

export default function Page() {
  return (
    <div className="bg-background flex-1 w-full flex flex-col items-center justify-center">
      <div className="mx-8 animate-pulse">
        <Image src={'/logo.svg'} width={200} height={200} alt="logo" />
      </div>
    </div>
  )
}
