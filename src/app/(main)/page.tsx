import { UserButton } from '@/auth/UserButton'

export default function Page() {
  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center gap-4 pb-80">
        <h1 className="text-2xl lg:text-6xl">🎉 Welcome to the Party 🥳</h1>
        <UserButton />
      </div>
    </>
  )
}
