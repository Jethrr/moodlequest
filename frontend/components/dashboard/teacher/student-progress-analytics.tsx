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
        <h3 className="text-xl font-bold">Student Progress Analytics</h3>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="semester">This Semester</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-[150px]">
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
        <TabsList>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="individual">Individual Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="engagement" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Class Engagement</CardTitle>
              <CardDescription>Daily active users and quest activity</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  activeUsers: {
                    label: "Active Users",
                    color: "hsl(var(--chart-1))",
                  },
                  questsStarted: {
                    label: "Quests Started",
                    color: "hsl(var(--chart-2))",
                  },
                  questsCompleted: {
                    label: "Quests Completed",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyEngagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line type="monotone" dataKey="activeUsers" stroke="var(--color-activeUsers)" name="Active Users" />
                    <Line
                      type="monotone"
                      dataKey="questsStarted"
                      stroke="var(--color-questsStarted)"
                      name="Quests Started"
                    />
                    <Line
                      type="monotone"
                      dataKey="questsCompleted"
                      stroke="var(--color-questsCompleted)"
                      name="Quests Completed"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Subject Performance</CardTitle>
              <CardDescription>Average scores and completion rates by subject</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  averageScore: {
                    label: "Average Score",
                    color: "hsl(var(--chart-1))",
                  },
                  completionRate: {
                    label: "Completion Rate",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="averageScore" fill="var(--color-averageScore)" name="Average Score" />
                    <Bar dataKey="completionRate" fill="var(--color-completionRate)" name="Completion Rate" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="individual" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Individual Student Progress</CardTitle>
              <CardDescription>Detailed progress for each student</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {studentProgressData.map((student) => (
                  <div key={student.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Level {student.level} • {student.questsCompleted} Quests • {student.badges} Badges
                        </div>
                      </div>
                      <div className="text-sm font-medium">{student.progress}%</div>
                    </div>
                    <Progress value={student.progress} className="h-2" />
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
