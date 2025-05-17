'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'
import { Quest } from '@/lib/api-client'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface MiniGame {
  id: string;
  title: string;
  playersCount: number;
  image: string;
  color: string;
}

interface LeaderboardUser {
  id: number;
  name: string;
  points: number;
  rank: string;
  avatar: string;
}

export default function StudentQuestsPage() {
  const [quests, setQuests] = useState<Quest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Mock user data (would come from auth in real app)
  const user = {
    name: "M. Rafif Atmaka",
    likes: 140,
    followers: 8402,
    expLevel: 140,
    currentExp: 2450,
    maxExp: 4200,
    rank: "MASTER",
    rankPoints: 1200
  }

  // Mock mini games data
  const miniGames: MiniGame[] = [
    {
      id: 'history-heroes',
      title: 'History Heroes',
      playersCount: 742,
      image: '/games/history-hero.png',
      color: 'bg-pink-500'
    },
    {
      id: 'language-war',
      title: 'Language War',
      playersCount: 82,
      image: '/games/language.png',
      color: 'bg-orange-400'
    },
    {
      id: 'questopia',
      title: 'Questopia',
      playersCount: 218,
      image: '/games/quest.png',
      color: 'bg-blue-500'
    },
    {
      id: 'math-master',
      title: 'Math Master',
      playersCount: 145,
      image: '/games/math.png',
      color: 'bg-purple-500'
    }
  ]

  // Mock leaderboard data
  const leaderboard: LeaderboardUser[] = [
    {
      id: 1,
      name: "Salsabila P",
      points: 9220,
      rank: "Grand Master",
      avatar: "/avatars/salsabila.png"
    },
    {
      id: 2,
      name: "Syahru M",
      points: 10520,
      rank: "Grand Master",
      avatar: "/avatars/syahru.png"
    },
    {
      id: 3,
      name: "Aditya A",
      points: 8900,
      rank: "Master",
      avatar: "/avatars/aditya.png"
    }
  ]

  // Mock daily quests
  const dailyQuests = [
    {
      id: 1,
      title: "Complete 2 Course From Your Class",
      exp: 140,
      progress: 50, // percentage
      icon: "📚"
    },
    {
      id: 2,
      title: "Challenge 2 Friends",
      exp: 250,
      progress: 0,
      icon: "🤝"
    }
  ]

  useEffect(() => {
    async function fetchQuests() {
      try {
        const fetchedQuests = await apiClient.getQuests()
        setQuests(fetchedQuests)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching quests:', err)
        setError('Failed to load quests')
        setLoading(false)
      }
    }
    
    fetchQuests()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  }

  const scaleOnHover = {
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 p-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-8 mb-8 flex justify-between items-center"
        >
          <div className="text-white">
            <h1 className="text-3xl font-bold mb-2">Learn, Play and Earn Free Gifts!</h1>
            <p className="text-teal-100 mb-4">Challenge your friends in quiz games and increase rank points to get exclusive prizes from us</p>
            <div className="flex gap-4">
              <button className="bg-white text-teal-600 px-6 py-2 rounded-full font-medium hover:bg-teal-50 transition-colors">
                View Rewards
              </button>
              <button className="bg-teal-700 text-white px-6 py-2 rounded-full font-medium hover:bg-teal-800 transition-colors">
                Get Started
              </button>
            </div>
          </div>
          <div className="w-1/3">
            <img src="/hero-illustration.png" alt="Gaming illustration" className="w-full" />
          </div>
        </motion.div>

        {/* Overview Section */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 mb-8"
        >
          <div className="flex items-center gap-8">
            {/* User Profile */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-amber-500 flex items-center justify-center">
                  <span className="text-2xl text-white">{user.name.charAt(0)}</span>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {user.expLevel}
                </div>
              </div>
              <div>
                <h2 className="font-bold text-xl">{user.name}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>❤️ {user.likes}</span>
                  <span>👥 {user.followers}</span>
                </div>
                <div className="mt-2">
                  <div className="text-xs text-gray-500 mb-1">Exp. Level</div>
                  <div className="w-48 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-amber-500 h-2 rounded-full" 
                      style={{ width: `${(user.currentExp / user.maxExp) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {user.currentExp} / {user.maxExp}
                  </div>
                </div>
              </div>
            </div>

            {/* Rank Badges */}
            <div className="flex-1 flex items-center justify-center gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
              <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
              <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-white font-bold">{user.rank}</div>
                </div>
              </div>
              <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
            </div>

            {/* Performance Chart */}
            <div className="w-64">
              <h3 className="font-semibold mb-2">Performance</h3>
              <div className="aspect-square relative bg-gray-50 rounded-lg p-4">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3/4 h-3/4 bg-teal-100 opacity-25 transform rotate-45"></div>
                </div>
                <div className="relative h-full flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-8 text-sm text-gray-600 w-full">
                    <div className="text-right">Teamwork</div>
                    <div>Solving</div>
                    <div className="text-right">Creative</div>
                    <div>Discipline</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Mini Games Section */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <h2 className="text-xl font-bold mb-4">Mini Games</h2>
          <div className="grid grid-cols-4 gap-4">
            {miniGames.map(game => (
              <motion.div 
                key={game.id}
                variants={itemVariants}
                whileHover={scaleOnHover}
                className={`${game.color} rounded-xl p-4 text-white cursor-pointer`}
              >
                <div className="h-32 mb-4 relative">
                  {/* Game illustration would go here */}
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{game.title}</h3>
                    <p className="text-sm opacity-75">{game.playersCount} Playing</p>
                  </div>
                  <button className="bg-white text-gray-800 px-3 py-1 rounded-full text-sm">
                    Play Now
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Leaderboard and Daily Quests */}
        <div className="grid grid-cols-2 gap-8">
          {/* Leaderboard */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Leaderboard</h2>
              <motion.button 
                whileHover={{ x: 5 }}
                className="text-blue-600"
              >
                View All →
              </motion.button>
            </div>
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {leaderboard.map((user, index) => (
                <motion.div
                  key={user.id}
                  variants={itemVariants}
                  whileHover={scaleOnHover}
                  className="flex items-center gap-4 bg-white p-3 rounded-lg"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center font-semibold">
                    {index + 1}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{user.name}</h3>
                    <p className="text-sm text-gray-600">{user.points} PTS</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Daily Quests */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Daily Quest</h2>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                className="text-blue-600"
              >
                Claim all
              </motion.button>
            </div>
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {dailyQuests.map(quest => (
                <motion.div
                  key={quest.id}
                  variants={itemVariants}
                  whileHover={scaleOnHover}
                  className="bg-white rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="text-2xl">{quest.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{quest.title}</h3>
                      <p className="text-sm text-amber-500">+{quest.exp} Exp</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-1">
                        {quest.progress}% Completed
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-amber-500 h-1.5 rounded-full" 
                          style={{ width: `${quest.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <button className="bg-teal-600 text-white px-4 py-1 rounded-full text-sm">
                      Claim Reward
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
} 