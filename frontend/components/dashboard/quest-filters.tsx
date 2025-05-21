import { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilterIcon, RotateCw } from "lucide-react";

interface Course {
  id: number;
  title: string;
  short_name: string;
}

interface QuestFiltersProps {
  onFilterChange: (filters: any) => void;
  defaultCourseId?: string | null;
  defaultActive?: boolean | null;
  defaultDifficulty?: string | null;
}

export function QuestFilters({ 
  onFilterChange,
  defaultCourseId = null,
  defaultActive = null,
  defaultDifficulty = null
}: QuestFiltersProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(defaultCourseId);
  const [activeStatus, setActiveStatus] = useState<string | null>(
    defaultActive === null ? null : defaultActive ? 'true' : 'false'
  );
  const [difficulty, setDifficulty] = useState<string | null>(defaultDifficulty);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [selectedCourse, activeStatus, difficulty]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      
      // First, trigger the Moodle API to fetch and store courses
      try {
        await fetch('/api/auth/courses', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
      } catch (err) {
        console.warn("Could not fetch courses from Moodle API, falling back to local database", err);
      }
      
      // Then, get the courses from our database
      const response = await fetch('/api/quests/courses');
      
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const filters: any = {};
    
    if (selectedCourse) {
      filters.courseId = selectedCourse;
    }
    
    if (activeStatus !== null) {
      filters.active = activeStatus;
    }
    
    if (difficulty) {
      filters.difficulty = difficulty;
    }
    
    onFilterChange(filters);
  };

  const resetFilters = () => {
    setSelectedCourse(null);
    setActiveStatus(null);
    setDifficulty(null);
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="space-y-4 sm:space-y-0 sm:flex sm:items-end sm:space-x-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="course">Course</Label>
            <Select
              value={selectedCourse || ''}
              onValueChange={(value) => setSelectedCourse(value === 'all' ? null : value)}
              disabled={loading || courses.length === 0}
            >
              <SelectTrigger id="course">
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    {course.short_name} - {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="status">Status</Label>
            <Select
              value={activeStatus || ''}
              onValueChange={(value) => setActiveStatus(value === 'all' ? null : value)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select
              value={difficulty || ''}
              onValueChange={(value) => setDifficulty(value === 'all' ? null : value)}
            >
              <SelectTrigger id="difficulty">
                <SelectValue placeholder="All Difficulties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="1">Easy (1)</SelectItem>
                <SelectItem value="2">Medium (2)</SelectItem>
                <SelectItem value="3">Hard (3)</SelectItem>
                <SelectItem value="4">Expert (4)</SelectItem>
                <SelectItem value="5">Master (5)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={resetFilters}
              title="Reset filters"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 