"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

// Mock data for achievements
const earnedBadges = [
  {
    id: 1,
    name: "Math Novice",
    description: "Complete 5 math quests",
    icon: "🧮",
    category: "Math",
    earnedDate: "May 15, 2023",
    rarity: "Common",
  },
  {
    id: 2,
    name: "Science Explorer",
    description: "Complete 5 science quests",
    icon: "🔬",
    category: "Science",
    earnedDate: "June 2, 2023",
    rarity: "Common",
  },
  {
    id: 3,
    name: "Perfect Score",
    description: "Get 100% on any quiz",
    icon: "🎯",
    category: "Achievement",
    earnedDate: "June 10, 2023",
    rarity: "Uncommon",
  },
  {
    id: 4,
    name: "Consistent Learner",
    description: "Complete quests for 7 consecutive days",
    icon: "📆",
    category: "Engagement",
    earnedDate: "July 5, 2023",
    rarity: "Rare",
  },
  {
    id: 5,
    name: "Team Player",
    description: "Complete 3 group quests",
    icon: "👥",
    category: "Collaboration",
    earnedDate: "July 20, 2023",
    rarity: "Uncommon",
  },
  {
    id: 6,
    name: "Fast Learner",
    description: "Complete a quest in record time",
    icon: "⚡",
    category: "Achievement",
    earnedDate: "August 3, 2023",
    rarity: "Rare",
  },
]

const inProgressBadges = [
  {
    id: 7,
    name: "Math Master",
    description: "Complete 20 math quests",
    icon: "🏆",
    category: "Math",
    progress: 60,
    rarity: "Epic",
  },
  {
    id: 8,
    name: "Science Wizard",
    description: "Complete 20 science quests",
    icon: "🧪",
    category: "Science",
    progress: 40,
    rarity: "Epic",
  },
  {
    id: 9,
    name: "Knowledge Seeker",
    description: "Complete 50 quests across all subjects",
    icon: "📚",
    category: "Achievement",
    progress: 75,
    rarity: "Legendary",
  },
  {
    id: 10,
    name: "Helping Hand",
    description: "Help 10 other students with their quests",
    icon: "🤝",
    category: "Collaboration",
    progress: 30,
    rarity: "Rare",
  },
]

export function Achievements() {
  const [activeTab, setActiveTab] = useState("earned")

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Achievements</h2>
        <p className="text-muted-foreground">Track your earned badges and unlock new achievements.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Badges</CardTitle>
            <CardDescription>Achievements unlocked</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{earnedBadges.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Rarest Badge</CardTitle>
            <CardDescription>Your most impressive achievement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-xl dark:bg-purple-800">
                {earnedBadges[3].icon}
              </div>
              <div>
                <div className="font-medium">{earnedBadges[3].name}</div>
                <div className="text-xs text-muted-foreground">{earnedBadges[3].rarity}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Next Achievement</CardTitle>
            <CardDescription>Almost there!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-xl dark:bg-purple-800">
                  {inProgressBadges[2].icon}
                </div>
                <div>
                  <div className="font-medium">{inProgressBadges[2].name}</div>
                  <div className="text-xs text-muted-foreground">{inProgressBadges[2].rarity}</div>
                </div>
              </div>
              <Progress value={inProgressBadges[2].progress} className="h-2" />
              <div className="text-xs text-right text-muted-foreground">{inProgressBadges[2].progress}% complete</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="earned" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="earned">Earned Badges</TabsTrigger>
          <TabsTrigger value="progress">In Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="earned" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {earnedBadges.map((badge) => (
              <Card key={badge.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-2xl dark:bg-purple-800">
                      {badge.icon}
                    </div>
                    <Badge
                      variant={
                        badge.rarity === "Common"
                          ? "outline"
                          : badge.rarity === "Uncommon"
                            ? "secondary"
                            : badge.rarity === "Rare"
                              ? "default"
                              : badge.rarity === "Epic"
                                ? "destructive"
                                : "default"
                      }
                    >
                      {badge.rarity}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mt-2">{badge.name}</CardTitle>
                  <CardDescription>{badge.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm">
                    <div className="text-muted-foreground">{badge.category}</div>
                    <div className="text-muted-foreground">Earned: {badge.earnedDate}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {inProgressBadges.map((badge) => (
              <Card key={badge.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-2xl dark:bg-gray-800">
                      {badge.icon}
                    </div>
                    <Badge
                      variant={
                        badge.rarity === "Common"
                          ? "outline"
                          : badge.rarity === "Uncommon"
                            ? "secondary"
                            : badge.rarity === "Rare"
                              ? "default"
                              : badge.rarity === "Epic"
                                ? "destructive"
                                : "default"
                      }
                    >
                      {badge.rarity}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mt-2">{badge.name}</CardTitle>
                  <CardDescription>{badge.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <div className="text-muted-foreground">{badge.category}</div>
                    </div>
                    <Progress value={badge.progress} className="h-2" />
                    <div className="text-xs text-right text-muted-foreground">{badge.progress}% complete</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
