import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { QuestCreator } from "@/components/dashboard/teacher/quest-creator"

export default function QuestManagementPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1 p-6">
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-bold tracking-tight">Create New Quest</h2>
              <p className="text-muted-foreground">
                Design learning quests with objectives, tasks, and rewards for your students
              </p>
            </div>
            <QuestCreator />
          </div>
        </main>
      </div>
    </div>
  )
}
