import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2Icon, DatabaseIcon, PlusCircleIcon } from 'lucide-react';

interface DemoControlsProps {
  onDemoDataCreated?: () => void;
}

export function QuestDemoControls({ onDemoDataCreated }: DemoControlsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const generateDummyData = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/quests/dummy-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to generate dummy data: ${response.status}`);
      }

      const data = await response.json();
      setSuccess(`Successfully created ${data.data?.quests || 0} quests, ${data.data?.courses || 0} courses, and ${data.data?.users || 0} users.`);
      
      if (onDemoDataCreated) {
        onDemoDataCreated();
      }
    } catch (error) {
      console.error('Error generating dummy data:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const generateSingleQuest = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/quests/single-dummy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to generate quest: ${response.status}`);
      }

      const data = await response.json();
      setSuccess(`Successfully created quest with ID ${data.quest_id}.`);
      
      if (onDemoDataCreated) {
        onDemoDataCreated();
      }
    } catch (error) {
      console.error('Error generating quest:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <DatabaseIcon className="h-5 w-5" />
          Demo Controls
        </CardTitle>
        <CardDescription>
          Generate test data for development purposes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mb-4">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex gap-2 justify-end">
        <Button 
          variant="outline" 
          onClick={generateSingleQuest}
          disabled={loading}
        >
          {loading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
          Create Single Quest
        </Button>
        <Button 
          onClick={generateDummyData} 
          disabled={loading}
        >
          {loading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
          <PlusCircleIcon className="mr-2 h-4 w-4" />
          Generate Dummy Data
        </Button>
      </CardFooter>
    </Card>
  );
} 