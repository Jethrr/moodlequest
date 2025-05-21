import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, RefreshCw, BookOpen } from "lucide-react";
import Link from 'next/link';

interface Course {
  id: number;
  title: string;
  description?: string;
  short_name: string;
  visible: boolean;
  start_date?: string;
  end_date?: string;
  moodle_course_id: number;
  enrollment?: {
    role: string;
    completion: number;
    last_access?: string;
  };
}

interface UserCoursesProps {
  userId?: number;
  limit?: number;
  showSync?: boolean;
}

export function UserCourses({ userId, limit, showSync = true }: UserCoursesProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncingCourses, setSyncingCourses] = useState(false);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/courses${userId ? `?userId=${userId}` : ''}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.status}`);
      }
      
      const data = await response.json();
      setCourses(data.courses || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncCourses = async () => {
    try {
      setSyncingCourses(true);
      await fetch('/api/courses/sync', { method: 'GET' });
      await fetchCourses(); // Refresh courses after sync
    } catch (error) {
      console.error('Error syncing courses:', error);
      setError('Failed to sync with Moodle');
    } finally {
      setSyncingCourses(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-7 w-40" />
          {showSync && <Skeleton className="h-9 w-32" />}
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Failed to load courses</CardDescription>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
          <Button onClick={fetchCourses} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Display limited courses or all
  const displayCourses = limit ? courses.slice(0, limit) : courses;
  
  if (displayCourses.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Courses</h3>
          {showSync && (
            <Button 
              onClick={handleSyncCourses} 
              variant="outline" 
              size="sm"
              disabled={syncingCourses}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${syncingCourses ? 'animate-spin' : ''}`} />
              {syncingCourses ? 'Syncing...' : 'Sync from Moodle'}
            </Button>
          )}
        </div>
        
        <Card className="border border-dashed">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center text-center p-4">
              <BookOpen className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No courses found</p>
              <Button 
                onClick={handleSyncCourses}
                variant="link" 
                className="mt-2"
                disabled={syncingCourses}
              >
                Sync courses from Moodle
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Courses</h3>
        {showSync && (
          <Button 
            onClick={handleSyncCourses} 
            variant="outline" 
            size="sm"
            disabled={syncingCourses}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${syncingCourses ? 'animate-spin' : ''}`} />
            {syncingCourses ? 'Syncing...' : 'Sync from Moodle'}
          </Button>
        )}
      </div>
      
      <div className="space-y-3">
        {displayCourses.map((course) => (
          <Link href={`/dashboard/courses/${course.id}`} key={course.id}>
            <Card className="hover:bg-accent/5 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{course.title}</h4>
                    <p className="text-sm text-muted-foreground">{course.short_name}</p>
                  </div>
                  
                  {!course.visible && (
                    <Badge variant="outline" className="ml-2">
                      Hidden
                    </Badge>
                  )}
                </div>
                
                {course.enrollment && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progress</span>
                      <span>{course.enrollment.completion}%</span>
                    </div>
                    <Progress value={course.enrollment.completion} className="h-1.5" />
                  </div>
                )}
                
                {course.start_date && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <CalendarIcon className="h-3 w-3" />
                    <span>Starts: {new Date(course.start_date).toLocaleDateString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      
      {courses.length > (limit || 0) && limit && (
        <div className="text-center">
          <Link href="/dashboard/courses">
            <Button variant="ghost" size="sm">
              View all courses ({courses.length})
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
} 