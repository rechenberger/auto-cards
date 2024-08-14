import { capitalCase } from 'change-case'

export const StatDisplay = ({
  label,
  value = 0,
}: {
  label: string
  value?: number
}) => {
  return (
    <>
      <div className="px-2 py-1 border rounded bg-border/50 flex flex-col items-center">
        <div className="text-lg font-bold">{value}</div>
        <div>{capitalCase(label)}</div>
      </div>
    </>
  )
}
