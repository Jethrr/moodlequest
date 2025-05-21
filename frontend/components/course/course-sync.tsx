'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Spinner } from '@/components/ui/spinner';

interface CourseSyncProps {
  onSyncComplete?: () => void;
}

export function CourseSync({ onSyncComplete }: CourseSyncProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  const handleSyncClick = async () => {
    try {
      setIsSyncing(true);
      
      const response = await fetch('/api/courses/sync', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to sync courses');
      }

      const data = await response.json();
      
      toast({
        title: 'Courses Synced',
        description: `Successfully synchronized ${data.count} courses.`,
        variant: 'default'
      });
      
      if (onSyncComplete) {
        onSyncComplete();
      }
      
    } catch (error) {
      console.error('Error syncing courses:', error);
      toast({
        title: 'Sync Failed',
        description: error instanceof Error ? error.message : 'Failed to sync courses from Moodle',
        variant: 'destructive'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Sync</CardTitle>
        <CardDescription>
          Synchronize your courses from Moodle
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          Courses are automatically synchronized from Moodle when you log in. 
          If you&apos;ve recently enrolled in new courses or don&apos;t see your courses, 
          use the &quot;Sync Now&quot; button to update your course list.
        </p>
        <Button 
          onClick={handleSyncClick} 
          disabled={isSyncing}
          className="w-full"
        >
          {isSyncing ? (
            <>
              <Spinner className="mr-2 h-4 w-4" /> 
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" /> 
              Sync Now
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
} 