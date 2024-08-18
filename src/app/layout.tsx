import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import { fontBody } from '@/lib/fonts'
import { cn } from '@/lib/utils'
import { ActionCommandProvider } from '@/super-action/command/ActionCommandProvider'
import { DialogProvider } from '@/super-action/dialog/DialogProvider'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Sack of Secrets: Battlegrounds',
    template: '%s | Sack of Secrets',
  },
  description: 'by Tristan Rechenberger',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={cn(
          'bg-background min-h-[100svh] flex flex-col',
          fontBody.className,
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider>
            {children}
            <ActionCommandProvider />
            <Toaster />
            <DialogProvider />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
