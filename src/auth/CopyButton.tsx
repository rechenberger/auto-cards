'use client'

import { toast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Copy } from 'lucide-react'
import { Input } from '@/components/ui/input'

export const CopyButton = ({
  text,
  value,
}: {
  text: string
  value: string
}) => {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="text"
        value={value}
        readOnly
        onClick={(e) => e.currentTarget.select()}
      />
      <Button
        size="icon"
        variant="outline"
        onClick={() => {
          navigator.clipboard.writeText(value)
          toast({
            title: 'Copied to clipboard',
            description: text,
          })
        }}
      >
        <Copy />
      </Button>
    </div>
  )
}
