import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, BookOpen, Clock, Award, CalendarIcon } from "lucide-react";
import Link from 'next/link';

interface Course {
  id: number;
  title: string;
  short_name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  visible?: boolean;
  moodle_course_id: number;
  enrollment?: {
    role: string;
    completion: number;
    grade?: number;
    last_access?: string;
  };
}

interface UserCourseProgressProps {
  userId: number;
}

export function UserCourseProgress({ userId }: UserCourseProgressProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchUserCourses();
  }, [userId]);
  
  const fetchUserCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/courses?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.status}`);
      }
      
      const data = await response.json();
      setCourses(data.courses || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load course progress');
    } finally {
      setLoading(false);
    }
  };

  // Calculate overall progress across all courses
  const calculateOverallProgress = () => {
    if (!courses.length) return 0;
    
    const coursesWithProgress = courses.filter(c => 
      c.enrollment && typeof c.enrollment.completion === 'number'
    );
    
    if (!coursesWithProgress.length) return 0;
    
    const totalProgress = coursesWithProgress.reduce(
      (sum, course) => sum + (course.enrollment?.completion || 0), 
      0
    );
    
    return Math.round(totalProgress / coursesWithProgress.length);
  };
  
  // Get active courses (those with progress < 100%)
  const getActiveCourses = () => {
    return courses.filter(c => 
      c.enrollment?.completion !== undefined && 
      c.enrollment.completion < 100 &&
      (c.visible !== false)
    );
  };

  // Get completed courses (those with progress = 100%)
  const getCompletedCourses = () => {
    return courses.filter(c => 
      c.enrollment?.completion !== undefined && 
      c.enrollment.completion === 100
    );
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Course Progress</CardTitle>
          <CardDescription>There was a problem loading course data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchUserCourses} variant="outline">Try Again</Button>
        </CardContent>
      </Card>
    );
  }
  
  if (!courses.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Course Progress</CardTitle>
          <CardDescription>No courses found for this user</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">This user is not enrolled in any courses yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const overallProgress = calculateOverallProgress();
  const activeCourses = getActiveCourses();
  const completedCourses = getCompletedCourses();
  
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Course Progress</CardTitle>
        <CardDescription>Overall completion across all courses</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <div>
              <span className="text-lg font-semibold">{overallProgress}%</span>
              <span className="text-muted-foreground ml-2">Complete</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {completedCourses.length} of {courses.length} courses completed
            </div>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>
        
        <Tabs defaultValue="active" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">Active Courses ({activeCourses.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedCourses.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="mt-4 space-y-4">
            {activeCourses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No active courses</p>
              </div>
            ) : (
              activeCourses.map(course => (
                <div key={course.id} className="border rounded-md p-4">
                  <div className="flex justify-between mb-1">
                    <div>
                      <h4 className="font-medium">{course.title}</h4>
                      <p className="text-sm text-muted-foreground">{course.short_name}</p>
                    </div>
                    <Link href={`/dashboard/courses/${course.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                  
                  {course.start_date && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2 mb-2">
                      <CalendarIcon className="h-3 w-3" />
                      <span>Started: {formatDate(course.start_date)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-xs mb-1 mt-2">
                    <span>Progress</span>
                    <span>{course.enrollment?.completion || 0}%</span>
                  </div>
                  <Progress value={course.enrollment?.completion || 0} className="h-1.5" />
                </div>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="mt-4 space-y-4">
            {completedCourses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Award className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No completed courses yet</p>
              </div>
            ) : (
              completedCourses.map(course => (
                <div key={course.id} className="border rounded-md p-4">
                  <div className="flex justify-between mb-1">
                    <div>
                      <h4 className="font-medium">{course.title}</h4>
                      <p className="text-sm text-muted-foreground">{course.short_name}</p>
                    </div>
                    <Link href={`/dashboard/courses/${course.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <Award className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium">Completed</span>
                    {course.enrollment?.grade && (
                      <span className="text-sm ml-auto">Grade: {course.enrollment.grade}%</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter>
        <Link href="/dashboard/courses" className="w-full">
          <Button variant="outline" className="w-full">
            View All Courses
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
} 