"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface QuestModalProps {
  quest: any
  isOpen: boolean
  onClose: () => void
}

export function QuestModal({ quest, isOpen, onClose }: QuestModalProps) {
  const [activeTab, setActiveTab] = useState("details")
  const [progress, setProgress] = useState(quest.progress)

  const handleCompleteTask = () => {
    if (progress < 100) {
      const newProgress = Math.min(progress + 25, 100)
      setProgress(newProgress)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{quest.title}</span>
            <Badge
              variant={
                quest.difficulty === "Easy" ? "outline" : quest.difficulty === "Medium" ? "secondary" : "destructive"
              }
            >
              {quest.difficulty}
            </Badge>
          </DialogTitle>
          <DialogDescription>{quest.description}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm font-medium">Category</div>
                <div className="text-sm">{quest.category}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium">Deadline</div>
                <div className="text-sm">{quest.deadline}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium">XP Reward</div>
                <div className="text-sm">{quest.xp} XP</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium">Status</div>
                <div className="text-sm capitalize">{quest.status.replace("-", " ")}</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Progress</div>
              <Progress value={progress} className="h-2" />
              <div className="text-xs text-right text-muted-foreground">{progress}% complete</div>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="py-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="task1"
                  className="h-4 w-4 rounded border-gray-300"
                  checked={progress >= 25}
                  onChange={handleCompleteTask}
                />
                <label htmlFor="task1" className={progress >= 25 ? "line-through text-muted-foreground" : ""}>
                  Read the introductory material
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="task2"
                  className="h-4 w-4 rounded border-gray-300"
                  checked={progress >= 50}
                  onChange={handleCompleteTask}
                />
                <label htmlFor="task2" className={progress >= 50 ? "line-through text-muted-foreground" : ""}>
                  Complete the practice exercises
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="task3"
                  className="h-4 w-4 rounded border-gray-300"
                  checked={progress >= 75}
                  onChange={handleCompleteTask}
                />
                <label htmlFor="task3" className={progress >= 75 ? "line-through text-muted-foreground" : ""}>
                  Take the quiz
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="task4"
                  className="h-4 w-4 rounded border-gray-300"
                  checked={progress >= 100}
                  onChange={handleCompleteTask}
                />
                <label htmlFor="task4" className={progress >= 100 ? "line-through text-muted-foreground" : ""}>
                  Submit final assignment
                </label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rewards" className="py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center justify-center rounded-lg border p-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-8 w-8 mb-2 text-yellow-500"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <div className="text-lg font-bold">{quest.xp} XP</div>
                <div className="text-sm text-muted-foreground">Experience Points</div>
              </div>
              <div className="flex flex-col items-center justify-center rounded-lg border p-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-8 w-8 mb-2 text-purple-500"
                >
                  <path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.11" />
                  <path d="M15 7a3 3 0 1 0-6 0c0 1.66.5 3 2 5h2c1.5-2 2-3.34 2-5Z" />
                </svg>
                <div className="text-lg font-bold">{quest.category} Badge</div>
                <div className="text-sm text-muted-foreground">Achievement Unlocked</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {progress < 100 && (
            <Button onClick={handleCompleteTask}>{progress === 0 ? "Start Quest" : "Continue Quest"}</Button>
          )}
          {progress === 100 && quest.status !== "completed" && <Button>Claim Rewards</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
