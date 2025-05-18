'use client'

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Providers } from "./providers"
import { AppLayout } from "@/components/layout/app-layout"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>MoodleQuest</title>
        <meta name="description" content="Gamified learning platform for Moodle" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <Providers>
            <AppLayout>
              {children}
            </AppLayout>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
