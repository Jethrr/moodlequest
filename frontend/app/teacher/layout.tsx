'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="font-bold text-xl">MoodleQuest</Link>
            <p className="text-muted-foreground">Teacher Portal</p>
          </div>
          <nav className="flex items-center space-x-4 lg:space-x-6">
            <Link 
              href="/teacher/dashboard" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/teacher/dashboard" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Dashboard
            </Link>
            <Link 
              href="/teacher/students" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/teacher/students" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Students
            </Link>
            <Link 
              href="/teacher/courses" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/teacher/courses" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Courses
            </Link>
          </nav>
          <div>
            <Button variant="outline" size="sm">
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
} 