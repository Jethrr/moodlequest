"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Line, LineChart, Bar, BarChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

// Mock data for analytics
const weeklyEngagementData = [
  { day: "Monday", activeUsers: 22, questsStarted: 15, questsCompleted: 8 },
  { day: "Tuesday", activeUsers: 24, questsStarted: 18, questsCompleted: 12 },
  { day: "Wednesday", activeUsers: 20, questsStarted: 14, questsCompleted: 10 },
  { day: "Thursday", activeUsers: 25, questsStarted: 20, questsCompleted: 15 },
  { day: "Friday", activeUsers: 18, questsStarted: 12, questsCompleted: 9 },
  { day: "Saturday", activeUsers: 12, questsStarted: 8, questsCompleted: 5 },
  { day: "Sunday", activeUsers: 10, questsStarted: 6, questsCompleted: 4 },
]

const subjectPerformanceData = [
  { subject: "Math", averageScore: 78, completionRate: 82 },
  { subject: "Science", averageScore: 85, completionRate: 75 },
  { subject: "English", averageScore: 72, completionRate: 68 },
  { subject: "History", averageScore: 80, completionRate: 70 },
  { subject: "Computer Science", averageScore: 90, completionRate: 85 },
]

const studentProgressData = [
  { name: "Sarah Johnson", progress: 85, level: 7, questsCompleted: 24, badges: 12 },
  { name: "Michael Rodriguez", progress: 72, level: 6, questsCompleted: 18, badges: 9 },
  { name: "Emily Chen", progress: 95, level: 8, questsCompleted: 28, badges: 15 },
  { name: "James Wilson", progress: 68, level: 5, questsCompleted: 15, badges: 7 },
  { name: "David Chen", progress: 78, level: 6, questsCompleted: 20, badges: 10 },
  { name: "Emma Davis", progress: 90, level: 7, questsCompleted: 26, badges: 14 },
  { name: "Sophia Martinez", progress: 65, level: 5, questsCompleted: 14, badges: 6 },
  { name: "Daniel Taylor", progress: 82, level: 6, questsCompleted: 22, badges: 11 },
]

export function StudentProgressAnalytics() {
  const [timeRange, setTimeRange] = useState("week")
  const [selectedSubject, setSelectedSubject] = useState("all")

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent">Student Progress Analytics</h3>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px] bg-muted/50 border-muted-foreground/20">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="semester">This Semester</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-[150px] bg-muted/50 border-muted-foreground/20">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              <SelectItem value="math">Math</SelectItem>
              <SelectItem value="science">Science</SelectItem>
              <SelectItem value="english">English</SelectItem>
              <SelectItem value="history">History</SelectItem>
              <SelectItem value="cs">Computer Science</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="engagement">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="engagement" className="data-[state=active]:bg-background">Engagement</TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-background">Performance</TabsTrigger>
          <TabsTrigger value="individual" className="data-[state=active]:bg-background">Individual Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="engagement" className="mt-6">
          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-emerald-700">Class Engagement</CardTitle>
              <CardDescription className="text-emerald-600/80">Daily active users and quest activity</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  activeUsers: {
                    label: "Active Users",
                    color: "hsl(142, 76%, 36%)", // emerald-600
                  },
                  questsStarted: {
                    label: "Quests Started",
                    color: "hsl(142, 71%, 45%)", // emerald-500
                  },
                  questsCompleted: {
                    label: "Quests Completed",
                    color: "hsl(141, 84%, 26%)", // emerald-700
                  },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyEngagementData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-emerald-200" />
                    <XAxis dataKey="day" className="text-emerald-900" />
                    <YAxis className="text-emerald-900" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line type="monotone" dataKey="activeUsers" stroke="var(--color-activeUsers)" name="Active Users" strokeWidth={2} />
                    <Line type="monotone" dataKey="questsStarted" stroke="var(--color-questsStarted)" name="Quests Started" strokeWidth={2} />
                    <Line type="monotone" dataKey="questsCompleted" stroke="var(--color-questsCompleted)" name="Quests Completed" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-purple-700">Subject Performance</CardTitle>
              <CardDescription className="text-purple-600/80">Average scores and completion rates by subject</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  averageScore: {
                    label: "Average Score",
                    color: "hsl(262, 83%, 58%)", // purple-600
                  },
                  completionRate: {
                    label: "Completion Rate",
                    color: "hsl(263, 70%, 50%)", // purple-500
                  },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-purple-200" />
                    <XAxis dataKey="subject" className="text-purple-900" />
                    <YAxis className="text-purple-900" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="averageScore" fill="var(--color-averageScore)" name="Average Score" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="completionRate" fill="var(--color-completionRate)" name="Completion Rate" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="individual" className="mt-6">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-blue-700">Individual Student Progress</CardTitle>
              <CardDescription className="text-blue-600/80">Detailed progress for each student</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {studentProgressData.map((student) => (
                  <div key={student.name} className="space-y-2 bg-white/50 dark:bg-slate-800/50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-blue-700 dark:text-blue-300">{student.name}</div>
                        <div className="text-sm text-blue-600/80 dark:text-blue-300/80">
                          Level {student.level} • {student.questsCompleted} Quests • {student.badges} Badges
                        </div>
                      </div>
                      <div className="text-sm font-medium text-blue-700 dark:text-blue-300">{student.progress}%</div>
                    </div>
                    <Progress value={student.progress} className="h-2 bg-blue-100 dark:bg-blue-950/30">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: `${student.progress}%` }} />
                    </Progress>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
