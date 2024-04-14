import { MainTop } from '@/components/layout/MainTop'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { Toaster } from '@/components/ui/toaster'
import { ActionCommandProvider } from '@/super-action/command/ActionCommandProvider'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Party Starter',
  description: 'by Tristan Rechenberger',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-background min-h-[100svh] flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <MainTop />
          <hr />
          <div className="container flex flex-col gap-8 py-8 flex-1">
            {children}
          </div>
          <ActionCommandProvider />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
