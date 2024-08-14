import { cn } from '@/lib/utils'
import { capitalCase } from 'change-case'

export const StatDisplay = ({
  label,
  value = 0,
  relative,
}: {
  label: string
  value?: number
  relative?: boolean
}) => {
  return (
    <>
      <div className="px-2 py-1 border rounded bg-border/50 flex flex-col items-center">
        <div
          className={cn(
            'text-lg font-bold',
            relative && (value < 0 ? 'text-red-500' : 'text-green-500'),
          )}
        >
          {relative && value > 0 ? '+' : ''}
          {value}
        </div>
        <div>{capitalCase(label)}</div>
      </div>
    </>
  )
}
