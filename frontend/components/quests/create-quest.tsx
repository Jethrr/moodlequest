"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trophy, Star, Clock, BookOpen } from "lucide-react"

// Dummy data for courses (will be replaced with API data later)
const DUMMY_COURSES = [
  { id: "cs101", name: "Introduction to Computer Science" },
  { id: "wd200", name: "Web Development Fundamentals" },
  { id: "ds202", name: "Data Structures and Algorithms" }
]

interface QuestFormData {
  title: string
  description: string
  courseId: string
  xpReward: number
  timeLimit: number
  difficulty: "easy" | "medium" | "hard"
  isHidden: boolean
  objectives: string[]
}

export function CreateQuest() {
  const [formData, setFormData] = useState<QuestFormData>({
    title: "",
    description: "",
    courseId: "",
    xpReward: 100,
    timeLimit: 30,
    difficulty: "medium",
    isHidden: false,
    objectives: [""]
  })

  const [activeTab, setActiveTab] = useState("edit")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement quest creation API call
    console.log("Creating quest:", formData)
  }

  const addObjective = () => {
    setFormData(prev => ({
      ...prev,
      objectives: [...prev.objectives, ""]
    }))
  }

  const updateObjective = (index: number, value: string) => {
    const newObjectives = [...formData.objectives]
    newObjectives[index] = value
    setFormData(prev => ({
      ...prev,
      objectives: newObjectives
    }))
  }

  const removeObjective = (index: number) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="container max-w-4xl py-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create New Quest</h1>
            <p className="text-muted-foreground">
              Design an engaging learning experience for your students
            </p>
          </div>
          <TabsList>
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="edit">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quest Details</CardTitle>
                <CardDescription>
                  Basic information about your quest
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Quest Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter a compelling title for your quest"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what students will learn and achieve"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="course">Course</Label>
                  <Select
                    value={formData.courseId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, courseId: value }))}
                  >
                    <SelectTrigger id="course">
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {DUMMY_COURSES.map(course => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quest Parameters</CardTitle>
                <CardDescription>
                  Set the challenge level and rewards
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="xpReward">XP Reward</Label>
                    <Input
                      id="xpReward"
                      type="number"
                      min="0"
                      value={formData.xpReward}
                      onChange={(e) => setFormData(prev => ({ ...prev, xpReward: parseInt(e.target.value) || 0 }))}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                    <Input
                      id="timeLimit"
                      type="number"
                      min="0"
                      value={formData.timeLimit}
                      onChange={(e) => setFormData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 0 }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value: "easy" | "medium" | "hard") => 
                      setFormData(prev => ({ ...prev, difficulty: value }))
                    }
                  >
                    <SelectTrigger id="difficulty">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="hidden"
                    checked={formData.isHidden}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isHidden: checked }))}
                  />
                  <Label htmlFor="hidden">Hide from students</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Learning Objectives</CardTitle>
                <CardDescription>
                  Define what students should achieve
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.objectives.map((objective, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={objective}
                      onChange={(e) => updateObjective(index, e.target.value)}
                      placeholder={`Objective ${index + 1}`}
                      required
                    />
                    {formData.objectives.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeObjective(index)}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addObjective}
                >
                  Add Objective
                </Button>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline">
                Cancel
              </Button>
              <Button type="submit">
                Create Quest
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardContent className="p-6">
              <div className="max-w-2xl mx-auto">
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">{formData.title || "Untitled Quest"}</h2>
                      {formData.courseId && (
                        <p className="text-sm text-muted-foreground">
                          {DUMMY_COURSES.find(c => c.id === formData.courseId)?.name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        formData.difficulty === "easy" ? "bg-green-100 text-green-700" :
                        formData.difficulty === "medium" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {formData.difficulty.charAt(0).toUpperCase() + formData.difficulty.slice(1)}
                      </div>
                      {formData.isHidden && (
                        <div className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                          Hidden
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Trophy className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{formData.xpReward} XP</p>
                        <p className="text-xs text-muted-foreground">Reward</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{formData.timeLimit} min</p>
                        <p className="text-xs text-muted-foreground">Time Limit</p>
                      </div>
                    </div>
                  </div>

                  {formData.description && (
                    <div className="prose prose-sm max-w-none">
                      <h3 className="text-lg font-semibold mb-2">Description</h3>
                      <p className="text-muted-foreground">{formData.description}</p>
                    </div>
                  )}

                  {formData.objectives.length > 0 && formData.objectives[0] !== "" && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Learning Objectives</h3>
                      <ul className="space-y-2">
                        {formData.objectives.map((objective, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="p-1 rounded-full bg-primary/10 mt-0.5">
                              <Star className="h-3 w-3 text-primary" />
                            </div>
                            <span className="text-sm">{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 