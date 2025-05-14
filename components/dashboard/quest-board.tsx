"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { QuestModal } from "@/components/dashboard/quest-modal"

// Mock data for quests
const quests = [
  {
    id: "1",
    title: "Introduction to Algebra",
    description: "Complete the introductory algebra module and quiz",
    xp: 50,
    progress: 25,
    difficulty: "Easy",
    category: "Math",
    deadline: "2 days left",
    status: "in-progress",
  },
  {
    id: "2",
    title: "Literary Analysis Essay",
    description: "Write a 500-word analysis of 'To Kill a Mockingbird'",
    xp: 100,
    progress: 0,
    difficulty: "Medium",
    category: "English",
    deadline: "5 days left",
    status: "not-started",
  },
  {
    id: "3",
    title: "Chemical Reactions Lab",
    description: "Complete the virtual lab on chemical reactions and submit your findings",
    xp: 75,
    progress: 100,
    difficulty: "Medium",
    category: "Science",
    deadline: "Completed",
    status: "completed",
  },
  {
    id: "4",
    title: "World War II Timeline",
    description: "Create a detailed timeline of major World War II events",
    xp: 120,
    progress: 60,
    difficulty: "Hard",
    category: "History",
    deadline: "1 day left",
    status: "in-progress",
  },
  {
    id: "5",
    title: "Spanish Conversation Practice",
    description: "Record a 3-minute conversation in Spanish with a classmate",
    xp: 80,
    progress: 0,
    difficulty: "Medium",
    category: "Languages",
    deadline: "3 days left",
    status: "not-started",
  },
  {
    id: "6",
    title: "Programming Basics Quiz",
    description: "Complete the quiz on programming fundamentals",
    xp: 60,
    progress: 100,
    difficulty: "Easy",
    category: "Computer Science",
    deadline: "Completed",
    status: "completed",
  },
]

export function QuestBoard() {
  const [activeTab, setActiveTab] = useState("all")
  const [selectedQuest, setSelectedQuest] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredQuests = activeTab === "all" ? quests : quests.filter((quest) => quest.status === activeTab)

  const openQuestModal = (quest) => {
    setSelectedQuest(quest)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Quest Board</h2>
        <p className="text-muted-foreground">Complete quests to earn XP and level up your learning journey.</p>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Quests</TabsTrigger>
          <TabsTrigger value="not-started">Not Started</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredQuests.map((quest) => (
              <Card key={quest.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{quest.title}</CardTitle>
                    <Badge
                      variant={
                        quest.difficulty === "Easy"
                          ? "outline"
                          : quest.difficulty === "Medium"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {quest.difficulty}
                    </Badge>
                  </div>
                  <CardDescription>{quest.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center">
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
                          className="h-4 w-4 mr-1 text-yellow-500"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        <span>{quest.xp} XP</span>
                      </div>
                      <span className="text-muted-foreground">{quest.deadline}</span>
                    </div>
                    <Progress value={quest.progress} className="h-2" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant={quest.status === "completed" ? "outline" : "default"}
                    className="w-full"
                    onClick={() => openQuestModal(quest)}
                  >
                    {quest.status === "completed" ? "View Details" : "Start Quest"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {isModalOpen && selectedQuest && (
        <QuestModal quest={selectedQuest} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  )
}
