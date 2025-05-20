"use client"

import { usePathname } from "next/navigation"
import { Navbar } from "@/components/ui/navbar"
import { TeacherNavbar } from "@/components/ui/teacher-navbar"
import { useAuth } from "@/lib/auth-context"
import { UserRole } from "@/lib/moodle-auth"
import { useEffect, useState } from "react"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()
  const { user, isLoading } = useAuth()
  const [isMounted, setIsMounted] = useState(false)
  
  // Define page types
  const isHomePage = pathname === '/'
  const isSignInPage = pathname === '/signin' || pathname === '/register'
  const isNotFoundPage = pathname === '/not-found' || pathname === '/404'
  const publicRoutes = ['/signin', '/register', '/', '/learn-more', '/faq', '/about']
  const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route))
  const isTeacherRoute = pathname?.startsWith('/teacher')

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

  // Determine if we should show navbar:
  // 1. Never show on not-found pages
  // 2. Never show on sign-in/register pages
  // 3. Show when user is authenticated (regardless of page)
  const showNavbar = !isNotFoundPage && !isSignInPage && user !== null;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 pb-24">
        {children}
      </main>
      {!isLoading && showNavbar && (
        <>
          {isTeacherRoute ? <TeacherNavbar /> : <Navbar />}
        </>
      )}
    </div>
  )
} 