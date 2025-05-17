"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

// Mock data for leaderboard
const weeklyLeaders = [
  {
    id: 1,
    name: "Alex Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    xp: 450,
    level: 8,
    badges: 12,
    rank: 1,
  },
  {
    id: 2,
    name: "Maria Garcia",
    avatar: "/placeholder.svg?height=40&width=40",
    xp: 420,
    level: 7,
    badges: 10,
    rank: 2,
  },
  { id: 3, name: "James Wilson", avatar: "/placeholder.svg?height=40&width=40", xp: 380, level: 7, badges: 9, rank: 3 },
  { id: 4, name: "Sarah Lee", avatar: "/placeholder.svg?height=40&width=40", xp: 350, level: 6, badges: 8, rank: 4 },
  { id: 5, name: "David Chen", avatar: "/placeholder.svg?height=40&width=40", xp: 320, level: 6, badges: 7, rank: 5 },
  { id: 6, name: "Emma Davis", avatar: "/placeholder.svg?height=40&width=40", xp: 290, level: 5, badges: 6, rank: 6 },
  {
    id: 7,
    name: "Michael Brown",
    avatar: "/placeholder.svg?height=40&width=40",
    xp: 260,
    level: 5,
    badges: 5,
    rank: 7,
  },
  {
    id: 8,
    name: "Sophia Martinez",
    avatar: "/placeholder.svg?height=40&width=40",
    xp: 230,
    level: 4,
    badges: 5,
    rank: 8,
  },
  {
    id: 9,
    name: "Daniel Taylor",
    avatar: "/placeholder.svg?height=40&width=40",
    xp: 200,
    level: 4,
    badges: 4,
    rank: 9,
  },
  {
    id: 10,
    name: "Olivia Anderson",
    avatar: "/placeholder.svg?height=40&width=40",
    xp: 180,
    level: 3,
    badges: 3,
    rank: 10,
  },
]

const allTimeLeaders = [
  {
    id: 1,
    name: "Maria Garcia",
    avatar: "/placeholder.svg?height=40&width=40",
    xp: 12500,
    level: 25,
    badges: 48,
    rank: 1,
  },
  {
    id: 2,
    name: "James Wilson",
    avatar: "/placeholder.svg?height=40&width=40",
    xp: 11800,
    level: 24,
    badges: 45,
    rank: 2,
  },
  {
    id: 3,
    name: "Alex Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    xp: 10900,
    level: 22,
    badges: 42,
    rank: 3,
  },
  {
    id: 4,
    name: "Emma Davis",
    avatar: "/placeholder.svg?height=40&width=40",
    xp: 9500,
    level: 20,
    badges: 38,
    rank: 4,
  },
  {
    id: 5,
    name: "David Chen",
    avatar: "/placeholder.svg?height=40&width=40",
    xp: 8800,
    level: 18,
    badges: 35,
    rank: 5,
  },
  { id: 6, name: "Sarah Lee", avatar: "/placeholder.svg?height=40&width=40", xp: 8200, level: 17, badges: 32, rank: 6 },
  {
    id: 7,
    name: "Michael Brown",
    avatar: "/placeholder.svg?height=40&width=40",
    xp: 7600,
    level: 16,
    badges: 30,
    rank: 7,
  },
  {
    id: 8,
    name: "Sophia Martinez",
    avatar: "/placeholder.svg?height=40&width=40",
    xp: 7100,
    level: 15,
    badges: 28,
    rank: 8,
  },
  {
    id: 9,
    name: "Daniel Taylor",
    avatar: "/placeholder.svg?height=40&width=40",
    xp: 6500,
    level: 14,
    badges: 25,
    rank: 9,
  },
  {
    id: 10,
    name: "Olivia Anderson",
    avatar: "/placeholder.svg?height=40&width=40",
    xp: 6000,
    level: 13,
    badges: 23,
    rank: 10,
  },
]

export function Leaderboard() {
  const [activeTab, setActiveTab] = useState("weekly")

  const currentUser = { id: 4, name: "Sarah Lee", rank: 4 } // Mock current user

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Leaderboard</h2>
        <p className="text-muted-foreground">See how you rank against other learners in the MoodleQuest community.</p>
      </div>

      <Tabs defaultValue="weekly" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              Your Rank: #{currentUser.rank}
            </Badge>
          </div>
          <TabsList>
            <TabsTrigger value="weekly">This Week</TabsTrigger>
            <TabsTrigger value="alltime">All Time</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="weekly" className="mt-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Weekly Top Learners</CardTitle>
              <CardDescription>Based on XP earned this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyLeaders.map((leader) => (
                  <div
                    key={leader.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      leader.id === currentUser.id ? "bg-muted" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8">
                        <span
                          className={`font-bold ${
                            leader.rank === 1
                              ? "text-yellow-500"
                              : leader.rank === 2
                                ? "text-gray-400"
                                : leader.rank === 3
                                  ? "text-amber-600"
                                  : ""
                          }`}
                        >
                          {leader.rank}
                        </span>
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={leader.avatar || "/placeholder.svg"} alt={leader.name} />
                        <AvatarFallback>{leader.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{leader.name}</div>
                        <div className="text-sm text-muted-foreground">Level {leader.level}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
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
                          className="h-4 w-4 text-purple-500"
                        >
                          <path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.11" />
                          <path d="M15 7a3 3 0 1 0-6 0c0 1.66.5 3 2 5h2c1.5-2 2-3.34 2-5Z" />
                        </svg>
                        <span className="text-sm">{leader.badges}</span>
                      </div>
                      <div className="flex items-center gap-1">
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
                          className="h-4 w-4 text-yellow-500"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        <span className="text-sm font-medium">{leader.xp} XP</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alltime" className="mt-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>All-Time Top Learners</CardTitle>
              <CardDescription>Based on total XP earned</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allTimeLeaders.map((leader) => (
                  <div
                    key={leader.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      leader.id === currentUser.id ? "bg-muted" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8">
                        <span
                          className={`font-bold ${
                            leader.rank === 1
                              ? "text-yellow-500"
                              : leader.rank === 2
                                ? "text-gray-400"
                                : leader.rank === 3
                                  ? "text-amber-600"
                                  : ""
                          }`}
                        >
                          {leader.rank}
                        </span>
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={leader.avatar || "/placeholder.svg"} alt={leader.name} />
                        <AvatarFallback>{leader.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{leader.name}</div>
                        <div className="text-sm text-muted-foreground">Level {leader.level}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
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
                          className="h-4 w-4 text-purple-500"
                        >
                          <path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.11" />
                          <path d="M15 7a3 3 0 1 0-6 0c0 1.66.5 3 2 5h2c1.5-2 2-3.34 2-5Z" />
                        </svg>
                        <span className="text-sm">{leader.badges}</span>
                      </div>
                      <div className="flex items-center gap-1">
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
                          className="h-4 w-4 text-yellow-500"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        <span className="text-sm font-medium">{leader.xp} XP</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
