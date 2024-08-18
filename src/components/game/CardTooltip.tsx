import { capitalCase } from 'change-case'

export const CardTooltip = ({
  name,
  text,
}: {
  name: string
  text?: string
}) => {
  return (
    <div className="bg-popover shadow-md p-2 border rounded-md max-w-40">
      <div className="font-bold">{capitalCase(name)}</div>
      {!!text && <div className="text-sm from-muted-foreground">{text}</div>}
    </div>
  )
}
