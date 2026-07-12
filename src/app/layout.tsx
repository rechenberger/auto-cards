import { isDev } from '@/auth/dev'
import { AppClientProviders } from '@/client/AppClientProviders'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import { fontBody } from '@/lib/fonts'
import { cn } from '@/lib/utils'
import type { Metadata } from 'next'
import './globals.css'

const titlePrefix = isDev() ? '[DEV] ' : ''

export const metadata: Metadata = {
  title: {
    default: `${titlePrefix}Auto Cards`,
    template: `${titlePrefix}%s | Auto Cards`,
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
        <AppClientProviders>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <TooltipProvider>
              {children}
              <Toaster />
            </TooltipProvider>
          </ThemeProvider>
        </AppClientProviders>
      </body>
    </html>
  )
}
