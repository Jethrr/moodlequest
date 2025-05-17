'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuests } from "@/hooks/use-quests"
import QuestForm from "@/components/quests/quest-form"
import QuestsList from "@/components/quests/quests-list"

export default function TeacherDashboard() {
  const [isCreating, setIsCreating] = useState(false)
  const { data: quests, isLoading, error } = useQuests()

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h1>
          <p className="text-muted-foreground">
            Manage quests and track student progress
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)} size="lg">
          Create New Quest
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quests Overview</CardTitle>
            <CardDescription>View and manage your quests</CardDescription>
          </CardHeader>
          <CardContent>
            {isCreating ? (
              <QuestForm
                onCancel={() => setIsCreating(false)}
                onSuccess={() => setIsCreating(false)}
              />
            ) : (
              <QuestsList quests={quests || []} isLoading={isLoading} error={error} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>Track student engagement and progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center p-8">
              <p className="text-muted-foreground">
                Analytics features will be available soon!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 