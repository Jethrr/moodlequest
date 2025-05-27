"use client"

import { usePathname } from "next/navigation"
import { Navbar } from "@/components/ui/navbar"
import { TeacherNavbar } from "@/components/ui/teacher-navbar"
import { LandingNavbar } from "@/components/ui/landing-navbar"
import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()
  const { user, isLoading } = useAuth()
  const [isMounted, setIsMounted] = useState(false)
  
  // Define page types
  const isNotFoundPage = pathname === '/not-found' || pathname === '/404'
  const isSignInPage = pathname === '/signin' || pathname === '/register'
  const publicRoutes = ['/signin', '/register', '/', '/learn-more', '/faq', '/about']
  const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route))

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // During server-side rendering or first mount, render minimal content to avoid hydration mismatch
  if (!isMounted) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">
          {children}
        </main>
      </div>
    )
  }

  // Don't show any navbar on not-found pages or sign-in/register pages
  if (isNotFoundPage || isSignInPage) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">
          {children}
        </main>
      </div>
    )
  }

  // For authenticated users, show the appropriate navbar based on their role
  if (user) {
    const isTeacherUser = user.role === 'teacher';
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 pb-24">
          {children}
        </main>
        {!isLoading && (
          isTeacherUser ? <TeacherNavbar /> : <Navbar />
        )}
      </div>
    )
  }

  // For unauthenticated users on public routes, show the landing navbar
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 pb-24">
        {children}
      </main>
      {!isLoading && isPublicRoute && <LandingNavbar />}
    </div>
  )
} 