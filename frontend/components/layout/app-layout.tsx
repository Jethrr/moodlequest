"use client"

import { usePathname } from "next/navigation"
import { Navbar } from "@/components/ui/navbar"
import { TeacherNavbar } from "@/components/ui/teacher-navbar"
import { LandingNavbar } from "@/components/ui/landing-navbar"
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
  const isHomePage = pathname === '/'
  const isSignInPage = pathname === '/signin'
  const isPublicRoute = ['/signin', '/register', '/'].includes(pathname || '')
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

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 pb-24">
        {children}
      </main>
      {!isLoading && (
        <>
          {isPublicRoute && !user && isHomePage && <LandingNavbar />}
          {!isPublicRoute && (isTeacherRoute ? <TeacherNavbar /> : <Navbar />)}
        </>
      )}
    </div>
  )
} 