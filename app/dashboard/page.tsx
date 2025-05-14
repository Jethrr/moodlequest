import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { QuestBoard } from "@/components/dashboard/quest-board"
import { VirtualPet } from "@/components/dashboard/virtual-pet"

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1 p-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <QuestBoard />
            </div>
            <div>
              <VirtualPet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
