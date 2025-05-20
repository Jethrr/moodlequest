'use client'

import { RoleGuard } from "@/components/auth/role-guard"
import { UserRole } from "@/lib/moodle-auth"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-transparent">
      {children}
    </div>
  )
} 