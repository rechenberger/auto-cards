import { SimpleDataCard } from '@/components/simple/SimpleDataCard'
import { Card } from '@/components/ui/card'
import { getItemByName } from '@/game/allItems'
import { ActionButton } from '@/super-action/button/ActionButton'
import { capitalCase } from 'change-case'

export const ItemCard = async ({ name }: { name: string }) => {
  const def = await getItemByName(name)
  const title = capitalCase(name)
  return (
    <>
      <Card className="p-4 flex flex-col gap-2">
        <h2>{title}</h2>
        {/* <AiImage
          prompt={`A beatiful but simple icon of ${title}. With a dark background.`}
        /> */}
        <div className="opacity-60 text-sm">{def.tags?.join(',')}</div>
        <SimpleDataCard data={[def.stats, ...(def.triggers ?? [])]} />
        <div className="flex-1" />
        <div className="flex flex-row gap-2 justify-end">
          <ActionButton
            hideIcon
            catchToast
            action={async () => {
              'use server'
            }}
          >
            ${def.price}
          </ActionButton>
        </div>
      </Card>
    </>
  )
}
