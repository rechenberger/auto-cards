'use client'

import { QueryLoading } from '@/components/api/QueryState'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Page() {
  const router = useRouter()
  useEffect(() => router.replace('/watch/leaderboard'), [router])
  return <QueryLoading label="Opening leaderboard…" />
}
