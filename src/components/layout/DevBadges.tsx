import { isDev, isLocalDb } from '@/auth/dev'

export const DevBadges = () => {
  return (
    <>
      {isLocalDb() && (
        <div className="text-sm bg-red-500/50 rounded-md px-2 py-1">
          Local DB
        </div>
      )}
      {isDev() && (
        <div className="text-sm bg-red-500/50 rounded-md px-2 py-1">DEV</div>
      )}
    </>
  )
}
