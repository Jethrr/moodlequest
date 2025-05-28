"use client"

import { Leaderboard } from "./leaderboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

/**
 * Example component showing different leaderboard configurations
 * This demonstrates how to use the leaderboard component for various scenarios
 */
export function LeaderboardExamples() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard Examples</CardTitle>
          <CardDescription>
            Different ways to use the leaderboard component with API integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="global" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="global">Global Leaderboard</TabsTrigger>
              <TabsTrigger value="course">Course Leaderboard</TabsTrigger>
              <TabsTrigger value="multiple">Multiple Courses</TabsTrigger>
            </TabsList>
            
            <TabsContent value="global" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Global Leaderboard</h3>
                <p className="text-muted-foreground mb-4">
                  Shows top students across all courses in the platform
                </p>
                <Leaderboard />
              </div>
            </TabsContent>
            
            <TabsContent value="course" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Course-Specific Leaderboard</h3>
                <p className="text-muted-foreground mb-4">
                  Shows top students for a specific course (course ID: 1)
                </p>
                <Leaderboard courseId={1} />
              </div>
            </TabsContent>
            
            <TabsContent value="multiple" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Mathematics Course</h3>
                  <Leaderboard courseId={1} className="h-fit" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Physics Course</h3>
                  <Leaderboard courseId={2} className="h-fit" />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Simple Global Leaderboard Component
 * Use this for the main dashboard
 */
export function GlobalLeaderboard() {
  return <Leaderboard />
}

/**
 * Course Leaderboard Component
 * Use this within course pages
 */
export function CourseLeaderboard({ courseId }: { courseId: number }) {
  return <Leaderboard courseId={courseId} />
}

/**
 * Compact Leaderboard Component
 * Shows only top 5 users (useful for sidebars or widgets)
 */
export function CompactLeaderboard({ courseId }: { courseId?: number }) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Top Players</CardTitle>
        <CardDescription>
          {courseId ? 'Course leaderboard' : 'Global rankings'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Leaderboard 
          courseId={courseId} 
          className="border-none shadow-none"
        />
      </CardContent>
    </Card>
  )
} 