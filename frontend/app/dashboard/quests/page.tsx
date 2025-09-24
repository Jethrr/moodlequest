'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { QuestFilters } from "@/components/dashboard/quest-filters";
import { QuestsList } from "@/components/dashboard/quests-list";
import { QuestCourseSummary } from "@/components/dashboard/quest-course-summary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilterIcon, RotateCw, BookOpen, LayoutGrid } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuestDemoControls } from "@/components/dashboard/quest-demo-controls";

function QuestsPageContent() {
  const searchParams = useSearchParams();
  const initialCourseId = searchParams.get('courseId');
  const [filters, setFilters] = useState<any>({
    courseId: initialCourseId || null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [quests, setQuests] = useState([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [isDev, setIsDev] = useState(false);

  useEffect(() => {
    fetchQuests(filters);
  }, [filters]);

  useEffect(() => {
    // Fetch courses from Moodle when the page loads
    fetchCoursesFromMoodle();
    fetchCourses();
  }, []);

  useEffect(() => {
    // Check if we're in development environment
    setIsDev(process.env.NODE_ENV === 'development');
  }, []);

  const fetchCoursesFromMoodle = async () => {
    try {
      // Trigger course sync from Moodle
      await fetch('/api/auth/courses', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error syncing courses from Moodle:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      setCoursesLoading(true);
      const response = await fetch('/api/quests/courses');
      
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setCoursesLoading(false);
    }
  };

  const fetchQuests = async (filterParams: any) => {
    try {
      setIsLoading(true);
      
      // Build query string from filters
      const queryParams = new URLSearchParams();
      if (filterParams.courseId) {
        queryParams.append('course_id', filterParams.courseId);
      }
      if (filterParams.active !== undefined && filterParams.active !== null) {
        queryParams.append('is_active', filterParams.active);
      }
      if (filterParams.difficulty) {
        queryParams.append('difficulty_level', filterParams.difficulty);
      }
      
      const response = await fetch(`/api/quests?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch quests: ${response.status}`);
      }
      
      const data = await response.json();
      setQuests(data.quests || []);
    } catch (error) {
      console.error('Error fetching quests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };
  
  const handleCourseSelect = (courseId: string | null) => {
    setFilters({ ...filters, courseId });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Quests</h1>
          <p className="text-muted-foreground">Complete quests to earn experience and level up</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <FilterIcon className="mr-2 h-4 w-4" />
            {showAdvancedFilters ? "Hide Filters" : "Advanced Filters"}
          </Button>
          <Button
            variant="outline"
            onClick={() => fetchCourses()}
            title="Refresh courses"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Course Filter Container */}
      <Card className="mb-4 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Course Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          {coursesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <Button
                key="all-courses"
                variant={filters.courseId === null ? "default" : "outline"}
                className="justify-start"
                onClick={() => handleCourseSelect(null)}
              >
                <LayoutGrid className="mr-2 h-4 w-4" />
                All Courses
              </Button>
              {courses.map((course: any) => (
                <Button
                  key={course.id}
                  variant={filters.courseId === course.id.toString() ? "default" : "outline"}
                  className="justify-start overflow-hidden"
                  onClick={() => handleCourseSelect(course.id.toString())}
                  title={course.title}
                >
                  <BookOpen className="mr-2 h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {course.short_name || course.title}
                  </span>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Show course summary when filtered by course */}
      {filters.courseId && <QuestCourseSummary courseId={filters.courseId} />}

      {showAdvancedFilters && (
        <QuestFilters 
          onFilterChange={handleFilterChange}
          defaultCourseId={filters.courseId}
        />
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        <QuestsList quests={quests} />
      )}

      {isDev && (
        <QuestDemoControls 
          onDemoDataCreated={() => {
            fetchCourses();
            fetchQuests(filters);
          }} 
        />
      )}
    </div>
  );
}

export default function QuestsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
        <Skeleton className="h-32 w-full" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    }>
      <QuestsPageContent />
    </Suspense>
  );
} 