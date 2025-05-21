'use client';

import { CourseList } from '@/components/course/course-list';
import { PageHeader } from '@/components/dashboard/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, GraduationCap } from 'lucide-react';

export default function CoursesPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <PageHeader
        title="My Courses"
        description="View and access your enrolled courses"
        icon={<BookOpen className="h-6 w-6" />}
      />
      
      <Tabs defaultValue="enrolled" className="space-y-4">
        <TabsList>
          <TabsTrigger value="enrolled" className="flex items-center">
            <BookOpen className="mr-2 h-4 w-4" />
            Enrolled
          </TabsTrigger>
          <TabsTrigger value="teaching" className="flex items-center">
            <GraduationCap className="mr-2 h-4 w-4" />
            Teaching
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="enrolled" className="space-y-4">
          <CourseList />
        </TabsContent>
        
        <TabsContent value="teaching" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Courses You Teach</CardTitle>
              <CardDescription>
                Courses where you have teacher or instructor role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This feature is coming soon. You will be able to manage courses you teach here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 