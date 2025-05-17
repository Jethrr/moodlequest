"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Star, Medal } from "lucide-react"

interface LeaderboardStats {
  lokal: {
    wins: number;
    losses: number;
  };
  winrate: number;
  kda: number;
}

interface LeaderboardPlayer {
  id: string;
  name: string;
  avatar: string;
  rank: 'Challenger' | 'Grandmaster' | 'Master' | 'Gold';
  stats: LeaderboardStats;
}

const timeFrames = ['24h', '7D', '30D', 'Seasonal'] as const
type TimeFrame = typeof timeFrames[number]

export function Leaderboard() {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>('24h')

  // Mock data - replace with real data from your API
  const topPlayers: LeaderboardPlayer[] = [
    {
      id: '1',
      name: 'BabyKnight',
      avatar: '/avatars/player1.png',
      rank: 'Challenger',
      stats: {
        lokal: { wins: 42, losses: 21 },
        winrate: 64,
        kda: 1.23
      }
    },
    {
      id: '2',
      name: 'Rootless',
      avatar: '/avatars/player2.png',
      rank: 'Challenger',
      stats: {
        lokal: { wins: 42, losses: 21 },
        winrate: 64,
        kda: 1.23
      }
    },
    {
      id: '3',
      name: 'Teodorr2000',
      avatar: '/avatars/player3.png',
      rank: 'Challenger',
      stats: {
        lokal: { wins: 42, losses: 21 },
        winrate: 64,
        kda: 1.23
      }
    },
  ]

  const otherPlayers: LeaderboardPlayer[] = [
    {
      id: '4',
      name: 'Rens',
      avatar: '/avatars/player4.png',
      rank: 'Challenger',
      stats: {
        lokal: { wins: 42, losses: 21 },
        winrate: 64,
        kda: 1.23
      }
    },
    {
      id: '5',
      name: 'Edwin',
      avatar: '/avatars/player5.png',
      rank: 'Challenger',
      stats: {
        lokal: { wins: 42, losses: 21 },
        winrate: 64,
        kda: 1.23
      }
    },
    // Add more players as needed
  ]

  const getRankIcon = (rank: LeaderboardPlayer['rank']) => {
    switch (rank) {
      case 'Challenger':
        return <Trophy className="h-4 w-4 text-yellow-500" />
      case 'Grandmaster':
        return <Star className="h-4 w-4 text-red-500" />
      case 'Master':
        return <Star className="h-4 w-4 text-purple-500" />
      case 'Gold':
        return <Medal className="h-4 w-4 text-yellow-400" />
      default:
        return null
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
              <h2 className="text-xl font-semibold">Inside the fire</h2>
              <p className="text-muted-foreground text-sm">
                The League of Legends Discord server, in collaboration with Riot Games
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Star className="h-4 w-4 mr-2" />
              Upgrade my data
            </Button>
            <Button variant="default" size="sm">Invite friends</Button>
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
          <Button variant="ghost" size="sm">Show my place</Button>
        </div>
      </div>

      {/* Top players */}
      <div className="grid grid-cols-3 gap-4 p-6">
        {topPlayers.map((player, index) => (
          <motion.div
            key={player.id}
            className="bg-card rounded-xl p-4 border"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={player.avatar} />
                <AvatarFallback>{player.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{player.name}</div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  {getRankIcon(player.rank)}
                  {player.rank}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground mb-1">Lokal stats</div>
                <div className="font-medium">
                  {player.stats.lokal.wins} - {player.stats.lokal.losses}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Winrate</div>
                <div className="font-medium text-emerald-500">{player.stats.winrate}%</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">KDA</div>
                <div className="font-medium text-purple-500">{player.stats.kda}</div>
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
              <th className="text-left font-medium py-2">Place</th>
              <th className="text-left font-medium py-2">Player name</th>
              <th className="text-left font-medium py-2">Lokal stats</th>
              <th className="text-left font-medium py-2">Winrate</th>
              <th className="text-left font-medium py-2">KDA</th>
              <th className="text-left font-medium py-2">Rank</th>
            </tr>
          </thead>
          <tbody>
            {otherPlayers.map((player, index) => (
              <motion.tr
                key={player.id}
                className="border-b last:border-0"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <td className="py-4">{index + 4}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={player.avatar} />
                      <AvatarFallback>{player.name[0]}</AvatarFallback>
                    </Avatar>
                    <span>{player.name}</span>
                  </div>
                </td>
                <td>
                  <span className="text-orange-500">{player.stats.lokal.wins}</span>
                  {' - '}
                  <span className="text-red-500">{player.stats.lokal.losses}</span>
                </td>
                <td className="text-emerald-500">{player.stats.winrate}%</td>
                <td className="text-purple-500">{player.stats.kda}</td>
                <td>
                  <div className="flex items-center gap-1">
                    {getRankIcon(player.rank)}
                    <span>{player.rank}</span>
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
