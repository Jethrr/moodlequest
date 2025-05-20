"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/lib/auth-context"
import { useState, useEffect } from "react"
import { 
  BookOpen, 
  Plus,
  Users,
  Search,
  Filter,
  GraduationCap
} from "lucide-react"
import Link from "next/link"

// Dummy data for courses
const DUMMY_COURSES = [
  {
    id: 1,
    name: "Introduction to Computer Science",
    code: "CS101",
    students: 45,
    quests: 8,
    completion_rate: 75
  },
  {
    id: 2,
    name: "Web Development Fundamentals",
    code: "WD200",
    students: 32,
    quests: 12,
    completion_rate: 60
  },
  {
    id: 3,
    name: "Data Structures and Algorithms",
    code: "CS202",
    students: 28,
    quests: 15,
    completion_rate: 45
  }
]

export default function TeacherDashboard() {
  const { user } = useAuth()
  const [courses, setCourses] = useState(DUMMY_COURSES)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")

  // Filter courses based on search query and filter
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (selectedFilter === "all") return matchesSearch
    if (selectedFilter === "high_completion") return matchesSearch && course.completion_rate >= 70
    if (selectedFilter === "low_completion") return matchesSearch && course.completion_rate < 70
    return matchesSearch
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container max-w-6xl py-6 space-y-8"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your courses and track student progress
          </p>
        </div>
        <Button className="w-full md:w-auto" asChild>
          <Link href="/teacher/quests/create">
            <Plus className="mr-2 h-4 w-4" />
            Create New Quest
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {courses.reduce((sum, course) => sum + course.students, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quests</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {courses.reduce((sum, course) => sum + course.quests, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Courses</CardTitle>
          <CardDescription>
            View and manage your courses and their associated quests
          </CardDescription>
          <div className="flex flex-col gap-4 mt-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="filter" className="whitespace-nowrap">Filter by:</Label>
              <select
                id="filter"
                className="p-2 rounded-md border"
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                aria-label="Filter courses"
              >
                <option value="all">All Courses</option>
                <option value="high_completion">High Completion (≥70%)</option>
                <option value="low_completion">Low Completion (&lt;70%)</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {filteredCourses.map((course) => (
                <Card key={course.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="font-semibold">{course.name}</h3>
                        <p className="text-sm text-muted-foreground">Course Code: {course.code}</p>
                      </div>
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{course.students} Students</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{course.quests} Quests</span>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full md:w-auto" asChild>
                          <Link href={`/teacher/courses/${course.id}/students`}>
                            Manage Course
                          </Link>
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span>Completion Rate</span>
                        <span className="font-medium">{course.completion_rate}%</span>
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-secondary">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{ width: `${course.completion_rate}%` }}
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
    </motion.div>
  )
} 