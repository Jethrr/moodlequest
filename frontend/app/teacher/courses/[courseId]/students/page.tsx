"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Filter, Star, Clock, Trophy, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Dummy data for students (will be replaced with API data later)
const DUMMY_STUDENTS = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    progress: 75,
    completedQuests: 6,
    totalQuests: 8,
    lastActive: "2024-03-20T10:30:00Z",
    xp: 450
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    progress: 90,
    completedQuests: 7,
    totalQuests: 8,
    lastActive: "2024-03-20T11:45:00Z",
    xp: 520
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob.johnson@example.com",
    progress: 40,
    completedQuests: 3,
    totalQuests: 8,
    lastActive: "2024-03-19T15:20:00Z",
    xp: 280
  }
]

export default function CourseStudentsPage({ params }: { params: { courseId: string } }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [progressFilter, setProgressFilter] = useState("all")

  // Filter students based on search query and progress filter
  const filteredStudents = DUMMY_STUDENTS.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (progressFilter === "all") return matchesSearch
    if (progressFilter === "high") return matchesSearch && student.progress >= 75
    if (progressFilter === "medium") return matchesSearch && student.progress >= 50 && student.progress < 75
    if (progressFilter === "low") return matchesSearch && student.progress < 50
    return matchesSearch
  })

  return (
    <div className="container max-w-6xl py-6 space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild className="mr-2">
              <Link href="/teacher/dashboard">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Course Students</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Track and manage student progress
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Progress</CardTitle>
          <CardDescription>
            Monitor student engagement and completion rates
          </CardDescription>
          <div className="flex flex-col gap-4 mt-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="progress-filter" className="whitespace-nowrap">Filter by progress:</Label>
              <select
                id="progress-filter"
                className="p-2 rounded-md border"
                value={progressFilter}
                onChange={(e) => setProgressFilter(e.target.value)}
                aria-label="Filter students by progress"
              >
                <option value="all">All Students</option>
                <option value="high">High Progress (≥75%)</option>
                <option value="medium">Medium Progress (50-74%)</option>
                <option value="low">Low Progress (&lt;50%)</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {filteredStudents.map((student) => (
                <Card key={student.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="font-semibold">{student.name}</h3>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                      </div>
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Trophy className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{student.xp} XP</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{student.completedQuests}/{student.totalQuests} Quests</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {new Date(student.lastActive).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full md:w-auto">
                          View Details
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span>Course Progress</span>
                        <span className="font-medium">{student.progress}%</span>
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-secondary">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{ width: `${student.progress}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
} 