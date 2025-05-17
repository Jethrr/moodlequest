'use client'

import type React from "react"
import { Inter } from "next/font/google"
import { usePathname } from "next/navigation"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Providers } from "./providers"
import { Navbar } from "@/components/ui/navbar"
import { useAuth } from "@/lib/auth-context"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const isPublicRoute = pathname === '/signin' || pathname === '/register' || pathname === '/' || false
  
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <Providers>
            <AppContent isPublicRoute={isPublicRoute}>
              {children}
            </AppContent>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}

function AppContent({ children, isPublicRoute }: { children: React.ReactNode, isPublicRoute: boolean }) {
  const { isAuthenticated, user, isLoading } = useAuth()
  const pathname = usePathname()
  const isTeacherRoute = pathname?.startsWith('/teacher') || false
  
  // For public routes, always show content
  if (isPublicRoute) {
    return (
      <main className="min-h-screen">
        {children}
      </main>
    )
  }
  
  // For protected routes, show content only when authenticated
  if (isAuthenticated) {
    const shouldShowNavbar = !isTeacherRoute
    
    return (
      <>
        <main className="min-h-screen pb-24">
          {children}
        </main>
        {shouldShowNavbar && <Navbar />}
      </>
    )
  }
  
  // If checking authentication or not authenticated on protected route,
  // show either nothing or a loading state
  return isLoading ? (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
    </div>
  ) : null // Return null when not authenticated and not loading, the auth provider will handle redirect
}
