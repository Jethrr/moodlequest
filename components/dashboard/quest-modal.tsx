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
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Quest } from "@/types/gamification"

interface QuestModalProps {
  quest: Quest
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
          <div className="flex items-center gap-2 mb-1 text-purple-600 text-xs font-medium">
            <span>{quest.category}</span>
            <span className="h-1 w-1 rounded-full bg-purple-300" />
            
          </div>
          <DialogTitle className="flex items-center justify-between">
            <span className="text-purple-900">{quest.title}</span>
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-normal",
                quest.difficulty === "Easy"
                  ? "border-green-200 bg-green-50 text-green-700"
                  : quest.difficulty === "Medium"
                  ? "border-purple-200 bg-purple-50 text-purple-700"
                  : "border-[#F88379] bg-red-50 text-[#F88379]"
              )}
            >
              {quest.difficulty}
            </Badge>
          </DialogTitle>
          <DialogDescription>{quest.description}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-purple-50 p-1 grid w-full grid-cols-3">
            <TabsTrigger
              value="details"
              className="data-[state=active]:bg-white data-[state=active]:text-purple-700"
            >
              Details
            </TabsTrigger>
            <TabsTrigger
              value="tasks"
              className="data-[state=active]:bg-white data-[state=active]:text-purple-700"
            >
              Tasks
            </TabsTrigger>
            <TabsTrigger
              value="rewards"
              className="data-[state=active]:bg-white data-[state=active]:text-purple-700"
            >
              Rewards
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 bg-purple-50/50 p-3 rounded-md">
                <div className="text-sm font-medium text-purple-700">Category</div>
                <div className="text-sm">{quest.category}</div>
              </div>
              <div className="space-y-1 bg-purple-50/50 p-3 rounded-md">
                <div className="text-sm font-medium text-purple-700">Deadline</div>
                <div className="text-sm">{quest.deadline}</div>
              </div>
              <div className="space-y-1 bg-purple-50/50 p-3 rounded-md">
                <div className="text-sm font-medium text-purple-700">XP Reward</div>
                <div className="text-sm">{quest.xp} XP</div>
              </div>
              <div className="space-y-1 bg-purple-50/50 p-3 rounded-md">
                <div className="text-sm font-medium text-purple-700">Status</div>
                <div className="text-sm capitalize">{quest.status.replace("-", " ")}</div>
              </div>
            </div>

            <div className="space-y-2 mt-2">
              <div className="text-sm font-medium text-purple-700">Progress</div>
              <div className="relative h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "absolute h-2 left-0 top-0 rounded-full",
                    progress === 100 ? "bg-green-500" : "bg-purple-500"
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs text-right text-muted-foreground">{progress}% complete</div>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="py-4">
            <div className="space-y-3 divide-y divide-gray-100">
              <div className="flex items-center gap-3 py-2.5">
                <div className="flex items-center justify-center w-5 h-5">
                  <input
                    type="checkbox"
                    id="task1"
                    className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    checked={progress >= 25}
                    onChange={handleCompleteTask}
                  />
                </div>
                <label
                  htmlFor="task1"
                  className={cn(
                    "text-sm flex-1",
                    progress >= 25 ? "line-through text-muted-foreground" : "text-gray-700"
                  )}
                >
                  Read the introductory material
                </label>
                <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200 text-xs">
                  +10 XP
                </Badge>
              </div>
              <div className="flex items-center gap-3 py-2.5">
                <div className="flex items-center justify-center w-5 h-5">
                  <input
                    type="checkbox"
                    id="task2"
                    className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    checked={progress >= 50}
                    onChange={handleCompleteTask}
                  />
                </div>
                <label
                  htmlFor="task2"
                  className={cn(
                    "text-sm flex-1",
                    progress >= 50 ? "line-through text-muted-foreground" : "text-gray-700"
                  )}
                >
                  Complete the practice exercises
                </label>
                <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200 text-xs">
                  +15 XP
                </Badge>
              </div>
              <div className="flex items-center gap-3 py-2.5">
                <div className="flex items-center justify-center w-5 h-5">
                  <input
                    type="checkbox"
                    id="task3"
                    className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    checked={progress >= 75}
                    onChange={handleCompleteTask}
                  />
                </div>
                <label
                  htmlFor="task3"
                  className={cn(
                    "text-sm flex-1",
                    progress >= 75 ? "line-through text-muted-foreground" : "text-gray-700"
                  )}
                >
                  Take the quiz
                </label>
                <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200 text-xs">
                  +20 XP
                </Badge>
              </div>
              <div className="flex items-center gap-3 py-2.5">
                <div className="flex items-center justify-center w-5 h-5">
                  <input
                    type="checkbox"
                    id="task4"
                    className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    checked={progress >= 100}
                    onChange={handleCompleteTask}
                  />
                </div>
                <label
                  htmlFor="task4"
                  className={cn(
                    "text-sm flex-1",
                    progress >= 100 ? "line-through text-muted-foreground" : "text-gray-700"
                  )}
                >
                  Submit final assignment
                </label>
                <Badge variant="outline" className="bg-[#F88379]/10 text-[#F88379] border-[#F88379]/20 text-xs">
                  +15 XP
                </Badge>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rewards" className="py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center justify-center rounded-md border border-purple-100 bg-purple-50/30 p-5">
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
                  className="h-9 w-9 mb-3 text-[#F88379]"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <div className="text-lg font-bold text-purple-900">{quest.xp} XP</div>
                <div className="text-sm text-muted-foreground">Experience Points</div>
              </div>
              <div className="flex flex-col items-center justify-center rounded-md border border-purple-100 bg-purple-50/30 p-5">
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
                  className="h-9 w-9 mb-3 text-purple-500"
                >
                  <path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.11" />
                  <path d="M15 7a3 3 0 1 0-6 0c0 1.66.5 3 2 5h2c1.5-2 2-3.34 2-5Z" />
                </svg>
                <div className="text-lg font-bold text-purple-900">{quest.category} Badge</div>
                <div className="text-sm text-muted-foreground">Achievement Unlocked</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="border-gray-200">
            Close
          </Button>
          {progress < 100 && (
            <Button
              onClick={handleCompleteTask}
              className="bg-purple-600 text-white hover:bg-purple-700"
            >
              {progress === 0 ? "Start Quest" : "Continue Quest"}
            </Button>
          )}
          {progress === 100 && quest.status !== "completed" && (
            <Button className="bg-[#F88379] text-white hover:bg-[#F88379]/90">
              Claim Rewards
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
