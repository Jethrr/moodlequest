import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CalendarIcon, BookIcon, ArrowRightIcon, StarIcon, Clock } from "lucide-react";
import Link from 'next/link';

interface Quest {
  quest_id: number;
  title: string;
  description: string;
  course_id: number;
  exp_reward: number;
  quest_type: string;
  validation_method: string;
  difficulty_level: number;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  course?: {
    title: string;
    short_name: string;
  };
  creator?: {
    name: string;
    username: string;
  };
  // User progress (will be populated from user_quest table)
  progress?: number;
  status?: 'not-started' | 'in-progress' | 'completed';
}

interface QuestsListProps {
  quests: Quest[];
}

export function QuestsList({ quests }: QuestsListProps) {
  // Function to format dates in a user-friendly way
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'No date set';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Function to get difficulty label and color
  const getDifficultyDetails = (level: number) => {
    const labels = ['', 'Easy', 'Medium', 'Hard', 'Expert', 'Master'];
    const colors = ['', 'success', 'warning', 'destructive', 'purple', 'yellow'];
    
    return {
      label: labels[level] || 'Unknown',
      color: colors[level] || 'default'
    };
  };
  
  // Function to get quest type badge
  const getQuestTypeDetails = (type: string) => {
    const types: Record<string, { label: string, color: string }> = {
      'assignment': { label: 'Assignment', color: 'blue' },
      'quiz': { label: 'Quiz', color: 'amber' },
      'challenge': { label: 'Challenge', color: 'green' },
      'project': { label: 'Project', color: 'purple' },
      'daily': { label: 'Daily', color: 'cyan' },
      'special': { label: 'Special', color: 'rose' }
    };
    
    return types[type] || { label: type, color: 'default' };
  };
  
  // Check if quests list is empty
  if (quests.length === 0) {
    return (
      <Card className="text-center p-8 border-dashed">
        <div className="flex flex-col items-center justify-center gap-2">
          <BookIcon className="h-10 w-10 text-muted-foreground" />
          <CardTitle>No Quests Found</CardTitle>
          <CardDescription className="max-w-sm">
            There are no quests matching your current filters, or no quests have been created yet.
          </CardDescription>
        </div>
      </Card>
    );
  }
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {quests.map((quest) => {
        const difficulty = getDifficultyDetails(quest.difficulty_level);
        const questType = getQuestTypeDetails(quest.quest_type);
        
        return (
          <Card key={quest.quest_id} className={`border overflow-hidden transition-all ${!quest.is_active ? 'opacity-70' : ''}`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg line-clamp-1">{quest.title}</CardTitle>
                {!quest.is_active && (
                  <Badge variant="outline" className="bg-muted">Inactive</Badge>
                )}
              </div>
              
              {quest.course && (
                <CardDescription>
                  <Link href={`/dashboard/courses/${quest.course_id}`} className="hover:underline">
                    {quest.course.short_name}
                  </Link>
                </CardDescription>
              )}
            </CardHeader>
            
            <CardContent className="pb-4">
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {quest.description || "No description provided"}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className={`bg-${questType.color}-100 text-${questType.color}-800 dark:bg-${questType.color}-900 dark:text-${questType.color}-200`}>
                  {questType.label}
                </Badge>
                
                <Badge variant="outline" className="flex gap-1 items-center">
                  <StarIcon className="h-3 w-3" />
                  <span>{difficulty.label}</span>
                </Badge>
                
                <Badge variant="outline" className="flex gap-1 items-center">
                  <span>+{quest.exp_reward} EXP</span>
                </Badge>
              </div>
              
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                {quest.start_date && (
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    <span>Starts: {formatDate(quest.start_date)}</span>
                  </div>
                )}
                
                {quest.end_date && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Due: {formatDate(quest.end_date)}</span>
                  </div>
                )}
              </div>
              
              {quest.progress !== undefined && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Progress</span>
                    <span className="font-medium">{quest.progress}%</span>
                  </div>
                  <Progress value={quest.progress} className="h-1.5" />
                </div>
              )}
            </CardContent>
            
            <CardFooter className="pt-0">
              <Button variant="secondary" size="sm" className="w-full" asChild>
                <Link href={`/dashboard/quests/${quest.quest_id}`}>
                  View Quest <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
} 