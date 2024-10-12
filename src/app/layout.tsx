import { isDev } from '@/auth/dev'
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
    default: 'Auto Cards',
    template: isDev() ? '%s | DEV' : '%s | Auto Cards',
  },
  description: 'Automatic Card Battle Game',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <link rel="manifest" href="/manifest.json" />
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
