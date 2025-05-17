import { QuestCreator } from "@/components/dashboard/teacher/quest-creator"

export default function QuestManagementPage() {
  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <main>
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
  )
}
