'use client'

import { Stats } from '@/game/stats'
import { Banana, Heart } from 'lucide-react'
import { Fragment } from 'react'
import { Progress } from '../ui/progress'

export const StatsBars = ({ stats }: { stats: Stats }) => {
  const bars = [
    {
      current: stats.health ?? 0,
      max: stats.healthMax ?? stats.health ?? 0,
      icon: Heart,
      bgClass: 'bg-red-500',
      tooltip: 'Health points.',
    },
    {
      current: stats.stamina ?? 0,
      max: stats.staminaMax ?? stats.stamina ?? 0,
      icon: Banana,
      bgClass: 'bg-yellow-500',
      tooltip: 'Stamina points.',
    },
  ]

  return (
    <div className="flex flex-col gap-2">
      {bars.map((bar, idx) => (
        <Fragment key={idx}>
          <div className="relative w-28 sm:w-40">
            <Progress
              value={100 * (bar.current / bar.max)}
              className="border shadow h-6"
              classNameIndicator={bar.bgClass}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="font-bold">
                {Math.max(bar.current, 0)} / {bar.max}
              </div>
            </div>
          </div>
        </Fragment>
      ))}
    </div>
  )
}
