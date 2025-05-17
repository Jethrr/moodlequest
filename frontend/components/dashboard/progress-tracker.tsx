"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Mock data for progress tracking
const weeklyData = [
  { day: "Mon", xp: 50, quests: 2 },
  { day: "Tue", xp: 80, quests: 3 },
  { day: "Wed", xp: 40, quests: 1 },
  { day: "Thu", xp: 120, quests: 4 },
  { day: "Fri", xp: 60, quests: 2 },
  { day: "Sat", xp: 30, quests: 1 },
  { day: "Sun", xp: 90, quests: 3 },
]

const monthlyData = [
  { week: "Week 1", xp: 350, quests: 12 },
  { week: "Week 2", xp: 420, quests: 15 },
  { week: "Week 3", xp: 280, quests: 10 },
  { week: "Week 4", xp: 390, quests: 14 },
]

const subjectProgress = [
  { subject: "Math", progress: 75, total: 20, completed: 15 },
  { subject: "Science", progress: 60, total: 18, completed: 11 },
  { subject: "English", progress: 90, total: 15, completed: 13 },
  { subject: "History", progress: 40, total: 12, completed: 5 },
  { subject: "Computer Science", progress: 85, total: 10, completed: 8 },
]

export function ProgressTracker() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Progress Tracker</h2>
        <p className="text-muted-foreground">Monitor your learning journey and track your achievements over time.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total XP</CardTitle>
            <CardDescription>Experience points earned</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1,450 XP</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Quests Completed</CardTitle>
            <CardDescription>Total learning missions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">52 / 78</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Current Level</CardTitle>
            <CardDescription>Your learning rank</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">Level 5</div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span>Progress to Level 6</span>
                <span>450/600 XP</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="weekly">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Activity Overview</h3>
          <TabsList>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="weekly" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <ChartContainer
                config={{
                  xp: {
                    label: "XP Earned",
                    color: "hsl(var(--chart-1))",
                  },
                  quests: {
                    label: "Quests Completed",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line type="monotone" dataKey="xp" stroke="var(--color-xp)" name="XP Earned" />
                    <Line type="monotone" dataKey="quests" stroke="var(--color-quests)" name="Quests Completed" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <ChartContainer
                config={{
                  xp: {
                    label: "XP Earned",
                    color: "hsl(var(--chart-1))",
                  },
                  quests: {
                    label: "Quests Completed",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line type="monotone" dataKey="xp" stroke="var(--color-xp)" name="XP Earned" />
                    <Line type="monotone" dataKey="quests" stroke="var(--color-quests)" name="Quests Completed" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div>
        <h3 className="text-xl font-bold mb-4">Subject Progress</h3>
        <div className="space-y-6">
          {subjectProgress.map((subject) => (
            <div key={subject.subject} className="space-y-2">
              <div className="flex justify-between">
                <div className="font-medium">{subject.subject}</div>
                <div className="text-sm text-muted-foreground">
                  {subject.completed} / {subject.total} quests completed
                </div>
              </div>
              <Progress value={subject.progress} className="h-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
