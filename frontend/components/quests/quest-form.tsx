'use client'

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useCreateQuest } from "@/hooks/use-quests"
import { toast } from "@/components/ui/use-toast"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

interface QuestFormProps {
  onSuccess: () => void
  onCancel: () => void
}

// Dummy courses data
const DUMMY_COURSES = [
  { id: 1, name: "Introduction to Computer Science" },
  { id: 2, name: "Web Development Fundamentals" },
  { id: 3, name: "Data Structures and Algorithms" },
  { id: 4, name: "Mobile App Development" },
  { id: 5, name: "Artificial Intelligence Basics" },
]

// Zod schema for quest form validation
const questSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  description: z.string().optional(),
  course_id: z.coerce.number().min(1, { message: "Please select a course" }),
  exp_reward: z.coerce.number().min(0, { message: "XP reward must be positive" }),
  quest_type: z.enum(["assignment", "quiz", "project", "challenge"]),
  validation_method: z.enum(["manual", "automatic", "peer_review"]),
  is_active: z.boolean().default(true),
  difficulty_level: z.coerce.number().min(1).max(5),
})

type QuestFormValues = z.infer<typeof questSchema>

export default function QuestForm({ onSuccess, onCancel }: QuestFormProps) {
  const createQuest = useCreateQuest()
  
  // Function to calculate XP based on difficulty level
  const calculateXP = (difficultyLevel: number): number => {
    const difficultyXPMap: Record<number, number> = {
      1: 20,  // Easy
      2: 50,  // Medium
      3: 100, // Hard
      4: 150, // Epic
      5: 200  // Legendary
    };
    return difficultyXPMap[difficultyLevel] || 50;
  };
  
  const form = useForm<QuestFormValues>({
    resolver: zodResolver(questSchema),
    defaultValues: {
      title: "",
      description: "",
      course_id: undefined,
      exp_reward: 20, // Default for Easy difficulty (level 1)
      quest_type: "assignment",
      validation_method: "manual",
      is_active: true,
      difficulty_level: 1,
    },
  })
  
  // Watch difficulty level and update XP automatically
  const watchedDifficulty = form.watch("difficulty_level");
  React.useEffect(() => {
    const calculatedXP = calculateXP(watchedDifficulty);
    form.setValue("exp_reward", calculatedXP);
  }, [watchedDifficulty, form]);
  
  const onSubmit = async (values: QuestFormValues) => {
    try {
      // Submit quest (using teacher ID 1 for demo)
      await createQuest.mutateAsync({
        quest: values,
        creatorId: 1 // For demo purposes, we're using a fixed creator ID
      })
      
      toast({
        title: "Quest created",
        description: "Your quest has been successfully created",
      })
      
      onSuccess()
    } catch (error: any) {
      toast({
        title: "Error creating quest",
        description: error.message || "Something went wrong",
        variant: "destructive",
      })
    }
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter quest title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe what students need to do" 
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="course_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DUMMY_COURSES.map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Choose which course this quest belongs to
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="exp_reward"
            render={({ field }) => (
              <FormItem>
                <FormLabel>XP Reward</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="quest_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quest Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="challenge">Challenge</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="validation_method"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Validation Method</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="automatic">Automatic</SelectItem>
                    <SelectItem value="peer_review">Peer Review</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="difficulty_level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Difficulty Level (1-5)</FormLabel>
                <FormControl>
                  <Input type="number" min={1} max={5} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Active</FormLabel>
                  <FormDescription>
                    Make this quest available to students
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={createQuest.isPending}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={createQuest.isPending}
          >
            {createQuest.isPending ? "Creating..." : "Create Quest"}
          </Button>
        </div>
      </form>
    </Form>
  )
} 