import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { TeacherDashboard } from "@/components/dashboard/teacher/teacher-dashboard"

export default function TeacherDashboardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1 p-6">
          <TeacherDashboard />
        </main>
      </div>
    </div>
  )
}
