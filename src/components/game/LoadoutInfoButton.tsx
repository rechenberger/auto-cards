import { LoadoutData } from '@/game/LoadoutData'
import { calcStats } from '@/game/calcStats'
import {
  streamDialog,
  superAction,
} from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { Calculator } from 'lucide-react'
import { LoadoutStaminaInfo } from './LoadoutStaminaInfo'
import { StatsDisplay } from './StatsDisplay'

export const LoadoutInfoButton = async ({
  loadout,
}: {
  loadout: LoadoutData
}) => {
  return (
    <>
      <ActionButton
        hideIcon
        variant="ghost"
        action={async () => {
          'use server'
          return superAction(async () => {
            const stats = await calcStats({ loadout })

            streamDialog({
              title: 'Stats',
              content: (
                <>
                  <div className="flex flex-col gap-2 items-center">
                    <hr className="my-2 self-stretch" />
                    <div className="text-lg">Starting stats</div>
                    <div className="flex flex-col flex-wrap">
                      <StatsDisplay stats={stats} showZero canWrap />
                    </div>
                    <hr className="my-2 self-stretch" />
                    <div className="text-lg">Stamina per second</div>
                    <LoadoutStaminaInfo loadout={loadout} />
                  </div>
                </>
              ),
            })
          })
        }}
      >
        <Calculator className="w-4 h-4" />
      </ActionButton>
    </>
  )
}
