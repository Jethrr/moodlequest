'use client'

import { TeacherNavbar } from "@/components/ui/teacher-navbar"

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 pb-24">
        {children}
      </main>
      <TeacherNavbar />
    </div>
  )
} 