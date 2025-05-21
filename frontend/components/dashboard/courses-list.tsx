'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Book, Calendar, Clock, Users, ArrowRight } from "lucide-react";
import Link from 'next/link';

interface Course {
  id: number;
  title: string;
  description: string;
  course_code: string;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  moodle_course_id: number | null;
}

export function CoursesList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true);
        // First try to sync courses from Moodle
        const syncResponse = await fetch('/api/courses/sync');
        
        // Regardless of sync result, fetch courses from our database
        const response = await fetch('/api/courses');
        
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
    }
    
    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Your Courses</h2>
          <Skeleton className="h-10 w-20" />
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border border-border">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-2/3 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Failed to load your courses</CardDescription>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Render no courses message if empty
  if (courses.length === 0) {
    return (
      <Card className="border border-dashed">
        <CardHeader>
          <CardTitle>No Courses Found</CardTitle>
          <CardDescription>You are not enrolled in any courses yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Courses you enroll in through Moodle will appear here. If you have already enrolled in courses, 
            try refreshing the page.
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
          >
            Refresh
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Courses</h2>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          Refresh
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Card key={course.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{course.title}</CardTitle>
                {!course.is_active && (
                  <Badge variant="outline" className="bg-muted text-muted-foreground">
                    Inactive
                  </Badge>
                )}
              </div>
              <CardDescription>
                {course.course_code}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {course.description || "No description available"}
              </p>
              
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-2">
                {course.start_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Starts: {new Date(course.start_date).toLocaleDateString()}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Last activity: 2 days ago</span>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span>Course progress</span>
                  <span className="font-medium">30%</span>
                </div>
                <Progress value={30} className="h-1.5" />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col gap-2">
              <Link href={`/dashboard/courses/${course.id}`} className="w-full">
                <Button className="w-full" variant="secondary">
                  Go to Course <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href={`/dashboard/quests?courseId=${course.id}`} className="w-full">
                <Button className="w-full" variant="outline" size="sm">
                  View Course Quests
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 