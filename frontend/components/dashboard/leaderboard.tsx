"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Star, Medal, Flame, Award } from "lucide-react"

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

export function Leaderboard() {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>('Weekly')

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

  const getRankIcon = (rank: string) => {
    switch (rank) {
      case 'Master':
        return <Trophy className="h-4 w-4 text-yellow-500" />
      case 'Expert':
        return <Star className="h-4 w-4 text-purple-500" />
      case 'Intermediate':
        return <Medal className="h-4 w-4 text-blue-500" />
      case 'Beginner':
        return <Award className="h-4 w-4 text-green-500" />
      default:
        return <Award className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="bg-background/95 backdrop-blur-lg rounded-xl border shadow-xl">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-orange-500 rounded-full p-3">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">MoodleQuest Leaderboard</h2>
              <p className="text-muted-foreground text-sm">
                Top learners ranked by experience points and achievements
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Flame className="h-4 w-4 mr-2 text-orange-500" />
              My Progress
            </Button>
            <Button variant="default" size="sm">Challenge Friends</Button>
          </div>
        </div>

        {/* Time frame selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {timeFrames.map((timeFrame) => (
              <motion.button
                key={timeFrame}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${selectedTimeFrame === timeFrame 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:bg-accent'
                  }`}
                onClick={() => setSelectedTimeFrame(timeFrame)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {timeFrame}
              </motion.button>
            ))}
          </div>
          <Button variant="ghost" size="sm">Show my ranking</Button>
        </div>
      </div>

      {/* Top players */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
        {topUsers.map((user, index) => (
          <motion.div
            key={user.id}
            className="bg-card rounded-xl p-4 border"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.profile_image_url || undefined} />
                <AvatarFallback>{`${user.first_name[0]}${user.last_name[0]}`}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{user.username}</div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  {getRankIcon(user.rank)}
                  {user.rank}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground mb-1">Level</div>
                <div className="font-medium text-amber-500">{user.level}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">XP Points</div>
                <div className="font-medium text-emerald-500">{user.stats.exp_points}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Quests</div>
                <div className="font-medium text-purple-500">{user.stats.quests_completed}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Leaderboard table */}
      <div className="p-6 border-t">
        <table className="w-full">
          <thead>
            <tr className="text-muted-foreground text-sm">
              <th className="text-left font-medium py-2">Rank</th>
              <th className="text-left font-medium py-2">User</th>
              <th className="text-left font-medium py-2">Level</th>
              <th className="text-left font-medium py-2">XP Points</th>
              <th className="text-left font-medium py-2">Quests</th>
              <th className="text-left font-medium py-2">Ranking</th>
            </tr>
          </thead>
          <tbody>
            {otherUsers.map((user, index) => (
              <motion.tr
                key={user.id}
                className="border-b last:border-0"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <td className="py-4">{index + 4}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profile_image_url || undefined} />
                      <AvatarFallback>{`${user.first_name[0]}${user.last_name[0]}`}</AvatarFallback>
                    </Avatar>
                    <span>{user.username}</span>
                  </div>
                </td>
                <td className="text-amber-500">{user.level}</td>
                <td className="text-emerald-500">{user.stats.exp_points}</td>
                <td className="text-purple-500">{user.stats.quests_completed}</td>
                <td>
                  <div className="flex items-center gap-1">
                    {getRankIcon(user.rank)}
                    <span>{user.rank}</span>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
