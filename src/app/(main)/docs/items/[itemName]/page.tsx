'use client'

import { DocsItemDetailClient } from '@/features/docs/DocsItemDetailClient'
import { useParams } from 'next/navigation'

export default function Page() {
  const { itemName } = useParams<{ itemName: string }>()
  return <DocsItemDetailClient itemName={itemName} />
}
