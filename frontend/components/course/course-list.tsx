'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, ArrowRight, Calendar, Users, BookCopy } from 'lucide-react';
import { CourseSync } from './course-sync';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Course {
  id: number;
  title: string;
  short_name: string;
  description?: string;
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

export function CourseList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/courses');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load courses');
      }
      
      const data = await response.json();
      setCourses(data.courses || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err instanceof Error ? err.message : 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSyncComplete = () => {
    fetchCourses();
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'PPP');
    } catch (e) {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-1/2 mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 mb-3" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (error || courses.length === 0) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>{error ? 'Error' : 'No Courses'}</CardTitle>
              <CardDescription>
                {error ? 'Failed to load your courses' : 'You are not enrolled in any courses'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {error 
                  ? 'There was an issue loading your courses. Please try synchronizing with Moodle.'
                  : 'You need to enroll in courses on Moodle first, then sync your courses here.'}
              </p>
            </CardContent>
          </Card>
        </div>
        <CourseSync onSyncComplete={handleSyncComplete} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Card key={course.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{course.title}</CardTitle>
                {!course.visible && (
                  <Badge variant="outline">Hidden</Badge>
                )}
              </div>
              <CardDescription>{course.short_name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground line-clamp-3 mb-4">
                {course.description || 'No description available'}
              </div>
              
              {course.enrollment && (
                <div className="space-y-3">
                  <div className="flex items-center text-xs text-muted-foreground mb-1">
                    <Badge variant="secondary" className="mr-2 capitalize">{course.enrollment.role}</Badge>
                    {course.enrollment.completion > 0 && (
                      <span className="ml-auto">{Math.round(course.enrollment.completion)}% complete</span>
                    )}
                  </div>
                  
                  {course.enrollment.completion > 0 && (
                    <Progress value={course.enrollment.completion} className="h-1" />
                  )}
                  
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    {course.start_date && (
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{formatDate(course.start_date)}</span>
                      </div>
                    )}
                    
                    {course.enrollment.last_access && (
                      <div className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        <span>Last accessed: {formatDate(course.enrollment.last_access)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/courses/${course.id}`}>
                  <BookCopy className="mr-2 h-4 w-4" />
                  View Course
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <CourseSync onSyncComplete={handleSyncComplete} />
        </div>
      </div>
    </div>
  );
} 