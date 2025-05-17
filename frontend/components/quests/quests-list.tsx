'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Quest } from "@/lib/api-client"
import { useDeleteQuest } from "@/hooks/use-quests"
import { toast } from "@/components/ui/use-toast"

// Dummy courses data (same as in quest-form.tsx)
const DUMMY_COURSES = [
  { id: 1, name: "Introduction to Computer Science" },
  { id: 2, name: "Web Development Fundamentals" },
  { id: 3, name: "Data Structures and Algorithms" },
  { id: 4, name: "Mobile App Development" },
  { id: 5, name: "Artificial Intelligence Basics" },
]

interface QuestsListProps {
  quests: Quest[]
  isLoading: boolean
  error: Error | null
}

export default function QuestsList({ quests, isLoading, error }: QuestsListProps) {
  const deleteQuest = useDeleteQuest()
  
  // Helper function to get course name by ID
  const getCourseName = (courseId: number | null) => {
    if (!courseId) return "No course assigned";
    const course = DUMMY_COURSES.find(c => c.id === courseId);
    return course ? course.name : `Course ID: ${courseId}`;
  }
  
  // Determine if we're using dummy data
  const usingDummyData = error != null;
  
  if (isLoading) {
    return <div className="flex justify-center p-8">Loading quests...</div>
  }
  
  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md">
          <p className="font-medium">Using demo data</p>
          <p className="text-sm">The backend API is not available. Using sample data for demonstration.</p>
          <p className="text-xs mt-2 text-yellow-600">Error: {error.message}</p>
        </div>
        
        {renderQuestsList()}
      </div>
    );
  }
  
  if (quests.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">No quests found. Create your first quest!</p>
      </div>
    )
  }
  
  function renderQuestsList() {
    return (
      <div className="space-y-4">
        {quests.map((quest) => (
          <Card key={quest.quest_id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{quest.title}</CardTitle>
                <Badge variant={quest.is_active ? "default" : "secondary"}>
                  {quest.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <CardDescription>
                Course: {getCourseName(quest.course_id)}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {quest.description || "No description provided"}
              </p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">Type: {quest.quest_type}</Badge>
                <Badge variant="outline">XP: {quest.exp_reward}</Badge>
                <Badge variant="outline">Difficulty: {quest.difficulty_level}</Badge>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <Button variant="ghost" size="sm">
                Edit
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => handleDelete(quest.quest_id)}
                disabled={deleteQuest.isPending}
              >
                {deleteQuest.isPending ? "Deleting..." : "Delete"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
  
  const handleDelete = (questId: number) => {
    if (confirm("Are you sure you want to delete this quest?")) {
      deleteQuest.mutate(questId, {
        onSuccess: () => {
          toast({
            title: "Quest deleted",
            description: "The quest has been successfully deleted.",
          })
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message || "Failed to delete quest",
            variant: "destructive",
          })
        }
      })
    }
  }
  
  return renderQuestsList();
} 