"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { QuestCreator } from "@/components/dashboard/teacher/quest-creator"
import { StudentProgressAnalytics } from "@/components/dashboard/teacher/student-progress-analytics"
import { ClassLeaderboard } from "@/components/dashboard/teacher/class-leaderboard"
import { Plus, Users, Award, BarChart3 } from "lucide-react"

export function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [showQuestCreator, setShowQuestCreator] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h2>
        <p className="text-muted-foreground">Manage your classes, create quests, and track student progress</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Active Students</CardTitle>
            <CardDescription>Students online now</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12 / 28</div>
            <p className="text-sm text-muted-foreground">43% of your class is currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Quest Completion</CardTitle>
            <CardDescription>Average completion rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">78%</div>
            <p className="text-sm text-muted-foreground">Up 12% from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Engagement Score</CardTitle>
            <CardDescription>Class participation level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8.4 / 10</div>
            <p className="text-sm text-muted-foreground">Based on activity and quest completion</p>
          </CardContent>
        </Card>
      </div>

      {showQuestCreator ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Create New Quest</h3>
            <Button variant="outline" onClick={() => setShowQuestCreator(false)}>
              Cancel
            </Button>
          </div>
          <QuestCreator />
        </div>
      ) : (
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            <Button onClick={() => setShowQuestCreator(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Quest
            </Button>
          </div>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Button variant="outline" className="h-auto flex flex-col items-center p-6 space-y-2">
                <Users className="h-10 w-10 mb-2" />
                <span className="text-lg font-medium">Manage Classes</span>
                <span className="text-sm text-muted-foreground text-center">View and manage your class rosters</span>
              </Button>
              <Button variant="outline" className="h-auto flex flex-col items-center p-6 space-y-2">
                <Award className="h-10 w-10 mb-2" />
                <span className="text-lg font-medium">Achievements</span>
                <span className="text-sm text-muted-foreground text-center">Create and assign custom badges</span>
              </Button>
              <Button variant="outline" className="h-auto flex flex-col items-center p-6 space-y-2">
                <BarChart3 className="h-10 w-10 mb-2" />
                <span className="text-lg font-medium">Reports</span>
                <span className="text-sm text-muted-foreground text-center">Generate detailed progress reports</span>
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest student interactions and completions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-2 border-b">
                    <div>
                      <div className="font-medium">Sarah Johnson</div>
                      <div className="text-sm text-muted-foreground">Completed "Algebra Basics" quest</div>
                    </div>
                    <div className="text-sm text-muted-foreground">10 minutes ago</div>
                  </div>
                  <div className="flex items-center justify-between p-2 border-b">
                    <div>
                      <div className="font-medium">Michael Rodriguez</div>
                      <div className="text-sm text-muted-foreground">Started "Chemical Reactions" quest</div>
                    </div>
                    <div className="text-sm text-muted-foreground">25 minutes ago</div>
                  </div>
                  <div className="flex items-center justify-between p-2 border-b">
                    <div>
                      <div className="font-medium">Emily Chen</div>
                      <div className="text-sm text-muted-foreground">Earned "Science Explorer" badge</div>
                    </div>
                    <div className="text-sm text-muted-foreground">1 hour ago</div>
                  </div>
                  <div className="flex items-center justify-between p-2 border-b">
                    <div>
                      <div className="font-medium">James Wilson</div>
                      <div className="text-sm text-muted-foreground">
                        Completed 3 tasks in "Literary Analysis" quest
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">2 hours ago</div>
                  </div>
                  <div className="flex items-center justify-between p-2">
                    <div>
                      <div className="font-medium">David Chen</div>
                      <div className="text-sm text-muted-foreground">Reached Level 5</div>
                    </div>
                    <div className="text-sm text-muted-foreground">3 hours ago</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="mt-6">
            <ClassLeaderboard />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <StudentProgressAnalytics />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
