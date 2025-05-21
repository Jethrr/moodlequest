'use client';

import { CoursesList } from "@/components/dashboard/courses-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function CoursesPage() {
  const handleSyncCourses = async () => {
    try {
      await fetch('/api/courses/sync', { method: 'GET' });
      window.location.reload();
    } catch (error) {
      console.error('Error syncing courses:', error);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Courses</h1>
          <p className="text-muted-foreground">View and access your enrolled courses</p>
        </div>
        <Button variant="outline" onClick={handleSyncCourses}>
          <RefreshCw className="mr-2 h-4 w-4" /> Sync with Moodle
        </Button>
      </div>

      <CoursesList />

      <Card>
        <CardHeader>
          <CardTitle>About Course Sync</CardTitle>
          <CardDescription>How course synchronization works</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Courses are automatically synchronized from Moodle when you log in. 
            If you've recently enrolled in new courses or don't see your courses, 
            use the "Sync with Moodle" button to update your course list.
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 