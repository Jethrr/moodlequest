import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Book, CalendarIcon, ArrowRightIcon } from "lucide-react";
import Link from "next/link";

interface Course {
  id: number;
  title: string;
  description?: string;
  short_name: string;
  visible?: boolean;
  start_date?: string;
  end_date?: string;
  moodle_course_id: number;
  enrollment?: {
    role: string;
    completion: number;
    last_access?: string;
  };
}

interface QuestCourseSummaryProps {
  courseId?: string | null;
}

export function QuestCourseSummary({ courseId }: QuestCourseSummaryProps) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (courseId) {
      fetchCourse(courseId);
    }
  }, [courseId]);

  const fetchCourse = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/quests/courses`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch course: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Find the specific course by id
      const foundCourse = Array.isArray(data.courses) && data.courses.length > 0 
        ? data.courses.find((c: Course) => c.id.toString() === id) || null
        : null;
      
      if (!foundCourse) {
        throw new Error("Course not found");
      }
      
      setCourse(foundCourse);
    } catch (err) {
      console.error("Error fetching course:", err);
      setError("Failed to load course information");
    } finally {
      setLoading(false);
    }
  };

  if (!courseId) {
    return null;
  }

  if (loading) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-8 w-full mt-4" />
        </CardContent>
      </Card>
    );
  }

  if (error || !course) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Course Information Unavailable</CardTitle>
          <CardDescription>
            {error || "Could not find the specified course"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => courseId && fetchCourse(courseId)}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle>{course.title}</CardTitle>
        <CardDescription className="flex items-center gap-2">
          <span>{course.short_name}</span>
          {course.visible === false && (
            <Badge variant="outline" className="text-xs">Hidden</Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {course.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {course.description}
          </p>
        )}
        
        {course.enrollment && (
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium">Course progress</span>
              <span>{course.enrollment.completion}%</span>
            </div>
            <Progress value={course.enrollment.completion} className="h-1.5" />
          </div>
        )}
        
        <Button variant="secondary" size="sm" className="w-full mt-2" asChild>
          <Link href={`/dashboard/courses/${course.id}`}>
            Go to Course <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
} 