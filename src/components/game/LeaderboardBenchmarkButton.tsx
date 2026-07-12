'use client'

import { Button } from '@/components/ui/button'
import type { Loadout } from '@/db/schema-zod'
import { Gauge } from 'lucide-react'
import Link from 'next/link'

export const LeaderboardBenchmarkButton = ({
  loadout: _loadout,
}: {
  loadout: Loadout
}) => (
  <Button variant="ghost" size="icon" className="size-11" asChild>
    <Link
      href="/admin/simulation"
      aria-label="Open the simulation tools"
      title="Leaderboard benchmarks moved to the simulation tools"
    >
      <Gauge className="size-4" aria-hidden="true" />
    </Link>
  </Button>
)
