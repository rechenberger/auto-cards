'use client'

import { QueryLoading } from '@/components/api/QueryState'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Page() {
  const router = useRouter()
  useEffect(() => router.replace('/docs/items'), [router])
  return <QueryLoading label="Opening item guide…" />
}
