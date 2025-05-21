"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Star, Medal, Flame, Award, Crown, Users, Calendar, History, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

interface LeaderboardStats {
  quests_completed: number;
  exp_points: number;
  rank_score: number;
}

interface LeaderboardUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  profile_image_url: string | null;
  rank: string;
  stats: LeaderboardStats;
  level: number;
}

const timeFrames = ['Daily', 'Weekly', 'Monthly', 'All Time'] as const
type TimeFrame = typeof timeFrames[number]

const rankIconMap = {
  'Master': {
    icon: <Trophy className="h-full w-full" />,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20"
  },
  'Expert': {
    icon: <Star className="h-full w-full" />,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20"
  },
  'Intermediate': {
    icon: <Medal className="h-full w-full" />,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20"
  },
  'Beginner': {
    icon: <Award className="h-full w-full" />,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20"
  },
}

export function Leaderboard() {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>('Weekly')
  const [searchQuery, setSearchQuery] = useState("")

  // Mock data - replace with real data from your API
  const topUsers: LeaderboardUser[] = [
    {
      id: 1,
      username: 'BabyKnight',
      first_name: 'John',
      last_name: 'Knight',
      profile_image_url: '/avatars/player1.png',
      rank: 'Master',
      stats: {
        quests_completed: 42,
        exp_points: 3650,
        rank_score: 1240
      },
      level: 15
    },
    {
      id: 2,
      username: 'Rootless',
      first_name: 'Sarah',
      last_name: 'Root',
      profile_image_url: '/avatars/player2.png',
      rank: 'Master',
      stats: {
        quests_completed: 38,
        exp_points: 3420,
        rank_score: 1180
      },
      level: 14
    },
    {
      id: 3,
      username: 'Teodorr2000',
      first_name: 'Teodor',
      last_name: 'Rus',
      profile_image_url: '/avatars/player3.png',
      rank: 'Expert',
      stats: {
        quests_completed: 35,
        exp_points: 3100,
        rank_score: 1050
      },
      level: 13
    },
  ]

  const otherUsers: LeaderboardUser[] = [
    {
      id: 4,
      username: 'Rens',
      first_name: 'Rens',
      last_name: 'Miller',
      profile_image_url: '/avatars/player4.png',
      rank: 'Expert',
      stats: {
        quests_completed: 31,
        exp_points: 2800,
        rank_score: 980
      },
      level: 12
    },
    {
      id: 5,
      username: 'Edwin',
      first_name: 'Edwin',
      last_name: 'Parks',
      profile_image_url: '/avatars/player5.png',
      rank: 'Intermediate',
      stats: {
        quests_completed: 28,
        exp_points: 2400,
        rank_score: 860
      },
      level: 10
    }
  ]

  const getRankInfo = (rank: string) => {
    return rankIconMap[rank as keyof typeof rankIconMap] || {
      icon: <Award className="h-full w-full" />,
      color: "text-gray-500",
      bgColor: "bg-gray-500/10",
      borderColor: "border-gray-500/20"
    }
  }

  const getTimeframeIcon = (timeframe: TimeFrame) => {
    switch (timeframe) {
      case 'Daily':
        return <Calendar className="h-4 w-4 mr-2" />
      case 'Weekly':
        return <Users className="h-4 w-4 mr-2" />
      case 'Monthly':
        return <Flame className="h-4 w-4 mr-2" />
      case 'All Time':
        return <History className="h-4 w-4 mr-2" />
    }
  }

  return (
    <Card className="overflow-hidden border-none shadow-lg">
      <div className="relative bg-gradient-to-br from-primary/20 via-background to-background p-6 border-b dark:border-border/50 border-primary/10">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 dark:bg-primary/5 bg-gradient-to-br from-orange-100/50 via-amber-50/30 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 dark:bg-primary/10 bg-gradient-to-tr from-blue-100/50 via-purple-50/30 to-transparent rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none"></div>
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-orange-500/20 dark:bg-orange-500/20 bg-gradient-to-br from-orange-200 to-amber-100 dark:from-orange-500/20 dark:to-amber-500/20 blur-md rounded-full"></div>
              <div className="relative bg-gradient-to-br from-orange-400 to-orange-600 dark:from-orange-400 dark:to-orange-600 rounded-full p-3 shadow-lg shadow-orange-500/20">
                <Trophy className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-amber-600 dark:text-white">Leaderboard</h2>
              <p className="text-muted-foreground text-sm">
                Compete with others and climb the ranks
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search players..."
                className="h-10 w-full rounded-md border border-input bg-white/50 dark:bg-background pl-10 pr-4 text-sm ring-offset-background backdrop-blur-sm transition-colors hover:bg-accent/10 focus:bg-accent/10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="default" size="sm" className="whitespace-nowrap bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-md shadow-primary/20">
              <Users className="h-4 w-4 mr-2" />
              Find Friends
            </Button>
          </div>
        </div>

        {/* Time frame selector */}
        <Tabs defaultValue={selectedTimeFrame} onValueChange={(v) => setSelectedTimeFrame(v as TimeFrame)} className="w-full">
          <TabsList className="grid grid-cols-4 w-full md:w-fit bg-white/50 dark:bg-background backdrop-blur-sm">
            {timeFrames.map((timeFrame) => (
              <TabsTrigger key={timeFrame} value={timeFrame} className="flex items-center data-[state=active]:bg-gradient-to-b data-[state=active]:from-primary/90 data-[state=active]:to-primary data-[state=active]:text-primary-foreground">
                {getTimeframeIcon(timeFrame)}
                <span className="hidden sm:inline">{timeFrame}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Top players podium */}
      <div className="relative p-6 pb-16 bg-gradient-to-b from-background via-background to-muted/20">
        <div className="flex items-end justify-center mb-8 mt-4">
          {/* Second place */}
          <motion.div
            className="flex-1 mx-2 order-1 z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex flex-col items-center">
              <Avatar className="h-16 w-16 border-4 border-primary/20 ring-2 ring-primary/10 mb-2 shadow-xl">
                <AvatarImage src={topUsers[1]?.profile_image_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">{topUsers[1]?.first_name[0]}{topUsers[1]?.last_name[0]}</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <div className="font-semibold truncate max-w-[80px] sm:max-w-full">
                  {topUsers[1]?.username}
                </div>
                <Badge variant="secondary" className="mt-1 bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20">
                  <Medal className="h-3 w-3 mr-1" />
                  2nd
                </Badge>
              </div>
            </div>
            <div className="h-28 mt-2 bg-gradient-to-t from-card/80 to-card/50 dark:from-card to-background border border-border/50 backdrop-blur-sm rounded-t-lg flex items-center justify-center px-4 shadow-lg">
              <div className="text-center">
                <div className="font-medium text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:text-primary/90">{topUsers[1]?.stats.exp_points}</div>
                <div className="text-xs text-muted-foreground">XP POINTS</div>
              </div>
            </div>
          </motion.div>

          {/* First place */}
          <motion.div 
            className="flex-1 mx-2 order-2 z-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="relative">
              <div className="absolute -top-14 left-1/2 -translate-x-1/2">
                <div className="relative">
                  <div className="absolute -inset-2 bg-yellow-500/20 rounded-full blur-md"></div>
                  <Crown className="h-8 w-8 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]" />
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <Avatar className="h-20 w-20 border-4 border-yellow-500/30 ring-4 ring-yellow-500/20 mb-2 shadow-xl">
                <AvatarImage src={topUsers[0]?.profile_image_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-amber-600 text-white">{topUsers[0]?.first_name[0]}{topUsers[0]?.last_name[0]}</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <div className="font-semibold truncate max-w-[100px] sm:max-w-full">
                  {topUsers[0]?.username}
                </div>
                <Badge variant="outline" className="bg-gradient-to-r from-yellow-600/80 to-amber-500/80 text-white border-none mt-1 shadow-md shadow-yellow-500/20">
                  <Trophy className="h-3 w-3 mr-1" />
                  1st
                </Badge>
              </div>
            </div>
            <div className="h-36 mt-2 bg-gradient-to-t from-card/80 to-card/50 dark:from-card to-background border border-border/50 backdrop-blur-sm rounded-t-lg flex items-center justify-center px-4 relative overflow-hidden shadow-lg">
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-32 w-32 bg-yellow-500/30 rounded-full blur-3xl"></div>
              </div>
              <div className="text-center relative">
                <div className="font-medium text-3xl bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-amber-500 dark:text-primary/90">{topUsers[0]?.stats.exp_points}</div>
                <div className="text-xs text-muted-foreground">XP POINTS</div>
              </div>
            </div>
          </motion.div>

          {/* Third place */}
          <motion.div 
            className="flex-1 mx-2 order-3 z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex flex-col items-center">
              <Avatar className="h-16 w-16 border-4 border-primary/20 ring-2 ring-primary/10 mb-2 shadow-xl">
                <AvatarImage src={topUsers[2]?.profile_image_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-green-600 text-white">{topUsers[2]?.first_name[0]}{topUsers[2]?.last_name[0]}</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <div className="font-semibold truncate max-w-[80px] sm:max-w-full">
                  {topUsers[2]?.username}
                </div>
                <Badge variant="secondary" className="mt-1 bg-gradient-to-r from-emerald-500/10 to-green-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">
                  <Medal className="h-3 w-3 mr-1" />
                  3rd
                </Badge>
              </div>
            </div>
            <div className="h-24 mt-2 bg-gradient-to-t from-card/80 to-card/50 dark:from-card to-background border border-border/50 backdrop-blur-sm rounded-t-lg flex items-center justify-center px-4 shadow-lg">
              <div className="text-center">
                <div className="font-medium text-2xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-green-600 dark:text-primary/90">{topUsers[2]?.stats.exp_points}</div>
                <div className="text-xs text-muted-foreground">XP POINTS</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Platform base */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-muted/30 to-card/50 dark:from-card dark:to-background border-t border-border/50 backdrop-blur-sm"></div>

        <h3 className="text-lg font-medium mb-4 px-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80 dark:text-primary">Ranking</h3>

        {/* Others leaderboard */}
        <div className="space-y-3">
          <AnimatePresence>
            {otherUsers.map((user, index) => {
              const rankInfo = getRankInfo(user.rank);
              return (
                <motion.div
                  key={user.id}
                  className="relative flex items-center bg-gradient-to-r from-card/90 to-card/50 hover:from-card/95 hover:to-card/60 dark:from-card/50 dark:to-background border border-border/50 rounded-lg p-3 overflow-hidden backdrop-blur-sm transition-colors shadow-md"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {/* Background decoration */}
                  <div className={`absolute right-0 top-0 bottom-0 w-1/3 ${rankInfo.bgColor} opacity-10 blur-xl pointer-events-none`}></div>
                  
                  <div className="flex items-center justify-between w-full gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted/80 dark:bg-muted text-sm font-medium border border-border/50">
                        {index + 4}
                      </div>
                      <Avatar className="h-10 w-10 border-2 border-muted ring-2 ring-border/50 shadow-md">
                        <AvatarImage src={user.profile_image_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary text-primary-foreground">{`${user.first_name[0]}${user.last_name[0]}`}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{user.username}</div>
                        <div className="flex items-center gap-1">
                          <div className={`h-5 w-5 rounded-full p-1 ${rankInfo.bgColor} shadow-sm`}>
                            {rankInfo.icon}
                          </div>
                          <span className={`text-sm ${rankInfo.color}`}>{user.rank}</span>
                        </div>
                      </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-8">
                      <div className="flex flex-col items-center">
                        <div className="text-xs text-muted-foreground">Level</div>
                        <div className="font-medium text-amber-600 dark:text-amber-500">{user.level}</div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="text-xs text-muted-foreground">Quests</div>
                        <div className="font-medium text-purple-600 dark:text-purple-500">{user.stats.quests_completed}</div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="text-xs text-muted-foreground">XP</div>
                        <div className="font-medium text-emerald-600 dark:text-emerald-500">{user.stats.exp_points}</div>
                      </div>
                    </div>

                    <div className="sm:hidden flex items-center gap-2">
                      <div className="text-sm font-medium text-amber-600 dark:text-amber-500">Lvl {user.level}</div>
                      <div className="text-sm text-muted-foreground">•</div>
                      <div className="text-sm font-medium text-emerald-600 dark:text-emerald-500">{user.stats.exp_points} XP</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <div className="mt-6 flex justify-center">
          <Button variant="outline" size="sm" className="bg-gradient-to-r from-card/80 to-card/50 hover:from-card/90 hover:to-card/60 border-primary/20 shadow-md">
            Show More
          </Button>
        </div>
      </div>
    </Card>
  )
}
