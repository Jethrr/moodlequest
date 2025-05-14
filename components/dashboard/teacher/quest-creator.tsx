"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { Quest, Task, Reward } from "@/types/gamification"
import { Plus, Trash2, Save } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function QuestCreator() {
  const [quest, setQuest] = useState<Partial<Quest>>({
    title: "",
    description: "",
    xp: 50,
    difficulty: "Medium",
    category: "",
    learningObjectives: [],
    tasks: [],
    rewards: [],
  })

  const [newObjective, setNewObjective] = useState("")
  const [newTask, setNewTask] = useState<Partial<Task>>({ description: "", xpReward: 10 })
  const [newReward, setNewReward] = useState<Partial<Reward>>({ type: "xp", value: 0, name: "" })

  const addLearningObjective = () => {
    if (newObjective.trim()) {
      setQuest({
        ...quest,
        learningObjectives: [...(quest.learningObjectives || []), newObjective],
      })
      setNewObjective("")
    }
  }

  const removeLearningObjective = (index: number) => {
    const updatedObjectives = [...(quest.learningObjectives || [])]
    updatedObjectives.splice(index, 1)
    setQuest({
      ...quest,
      learningObjectives: updatedObjectives,
    })
  }

  const addTask = () => {
    if (newTask.description?.trim()) {
      setQuest({
        ...quest,
        tasks: [
          ...(quest.tasks || []),
          {
            id: `task-${Date.now()}`,
            description: newTask.description,
            completed: false,
            xpReward: newTask.xpReward || 10,
          } as Task,
        ],
      })
      setNewTask({ description: "", xpReward: 10 })
    }
  }

  const removeTask = (index: number) => {
    const updatedTasks = [...(quest.tasks || [])]
    updatedTasks.splice(index, 1)
    setQuest({
      ...quest,
      tasks: updatedTasks,
    })
  }

  const addReward = () => {
    if (newReward.name?.trim() && newReward.value) {
      setQuest({
        ...quest,
        rewards: [
          ...(quest.rewards || []),
          {
            type: newReward.type,
            value: newReward.value,
            name: newReward.name,
            description: newReward.description,
          } as Reward,
        ],
      })
      setNewReward({ type: "xp", value: 0, name: "" })
    }
  }

  const removeReward = (index: number) => {
    const updatedRewards = [...(quest.rewards || [])]
    updatedRewards.splice(index, 1)
    setQuest({
      ...quest,
      rewards: updatedRewards,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Calculate total XP from tasks
    const taskXP = (quest.tasks || []).reduce((sum, task) => sum + (task.xpReward || 0), 0)

    // Add additional XP from rewards
    const rewardXP = (quest.rewards || [])
      .filter((reward) => reward.type === "xp")
      .reduce((sum, reward) => sum + (reward.value || 0), 0)

    const totalXP = taskXP + rewardXP

    const completeQuest: Quest = {
      id: `quest-${Date.now()}`,
      title: quest.title || "Untitled Quest",
      description: quest.description || "",
      xp: totalXP,
      progress: 0,
      difficulty: quest.difficulty as "Easy" | "Medium" | "Hard" | "Epic",
      category: quest.category || "General",
      deadline: "2 weeks",
      status: "not-started",
      createdBy: "teacher-123",
      learningObjectives: quest.learningObjectives,
      tasks: quest.tasks as Task[],
      rewards: quest.rewards as Reward[],
    }

    // In a real app, this would send the quest to the server
    console.log("Created quest:", completeQuest)

    // Reset form
    setQuest({
      title: "",
      description: "",
      xp: 50,
      difficulty: "Medium",
      category: "",
      learningObjectives: [],
      tasks: [],
      rewards: [],
    })

    // Show success message
    alert("Quest created successfully!")
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Create New Quest</CardTitle>
          <CardDescription>
            Design a learning quest for your students with tasks, objectives, and rewards
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Quest Title</Label>
                <Input
                  id="title"
                  value={quest.title}
                  onChange={(e) => setQuest({ ...quest, title: e.target.value })}
                  placeholder="Enter quest title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={quest.category}
                  onChange={(e) => setQuest({ ...quest, category: e.target.value })}
                  placeholder="e.g., Math, Science, English"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={quest.description}
                onChange={(e) => setQuest({ ...quest, description: e.target.value })}
                placeholder="Describe the quest and what students will learn"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  value={quest.difficulty}
                  onValueChange={(value) => setQuest({ ...quest, difficulty: value as any })}
                >
                  <SelectTrigger id="difficulty">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                    <SelectItem value="Epic">Epic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Learning Objectives</Label>
            <div className="flex space-x-2">
              <Input
                value={newObjective}
                onChange={(e) => setNewObjective(e.target.value)}
                placeholder="Add a learning objective"
              />
              <Button type="button" onClick={addLearningObjective} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {quest.learningObjectives?.map((objective, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {objective}
                  <button
                    type="button"
                    onClick={() => removeLearningObjective(index)}
                    className="ml-1 rounded-full hover:bg-muted p-1"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tasks</Label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
              <div className="sm:col-span-3">
                <Input
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Task description"
                />
              </div>
              <div>
                <Input
                  type="number"
                  value={newTask.xpReward}
                  onChange={(e) => setNewTask({ ...newTask, xpReward: Number.parseInt(e.target.value) || 0 })}
                  placeholder="XP"
                  min="0"
                />
              </div>
            </div>
            <Button type="button" onClick={addTask} variant="outline" size="sm" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>

            <div className="space-y-2 mt-2">
              {quest.tasks?.map((task, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex-1">
                    <div className="font-medium">{task.description}</div>
                    <div className="text-sm text-muted-foreground">{task.xpReward} XP</div>
                  </div>
                  <Button
                    type="button"
                    onClick={() => removeTask(index)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Rewards</Label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
              <div>
                <Select
                  value={newReward.type}
                  onValueChange={(value) => setNewReward({ ...newReward, type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xp">XP</SelectItem>
                    <SelectItem value="badge">Badge</SelectItem>
                    <SelectItem value="item">Item</SelectItem>
                    <SelectItem value="pet-accessory">Pet Accessory</SelectItem>
                    <SelectItem value="currency">Currency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Input
                  type="number"
                  value={newReward.value}
                  onChange={(e) => setNewReward({ ...newReward, value: Number.parseInt(e.target.value) || 0 })}
                  placeholder="Value"
                  min="0"
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  value={newReward.name}
                  onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
                  placeholder="Reward name"
                />
              </div>
            </div>
            <Button type="button" onClick={addReward} variant="outline" size="sm" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Reward
            </Button>

            <div className="space-y-2 mt-2">
              {quest.rewards?.map((reward, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex-1">
                    <div className="font-medium">{reward.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {reward.type.toUpperCase()} - {reward.value} {reward.type === "xp" ? "points" : "units"}
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={() => removeReward(index)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Create Quest
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
