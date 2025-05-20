'use client'

import { ThemeProvider } from "@/components/theme-provider"
import { Providers } from "./providers"
import { AppLayout } from "@/components/layout/app-layout"
import { IdleCursor } from "@/components/ui/idle-cursor"
import type { ReactNode } from "react"

interface RootLayoutClientProps {
  children: ReactNode
}

export function RootLayoutClient({ children }: RootLayoutClientProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
    >
      <Providers>
        <AppLayout>
          {children}
        </AppLayout>
        <IdleCursor idleTimeout={8000} />
      </Providers>
    </ThemeProvider>
  )
} 