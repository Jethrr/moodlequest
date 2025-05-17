'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'
import { Quest } from '@/lib/api-client'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trophy, 
  Star, 
  Medal, 
  BookOpen, 
  ChevronRight, 
  Play,
  Gift,
  Flag,
  Flame,
  Users,
  Sparkles,
  Crown,
  ArrowUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface MiniGame {
  id: string;
  title: string;
  playersCount: number;
  image: string;
  color: string;
  badge: string;
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
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  // Mock user data (would come from auth in real app)
  const user = {
    name: "M. Rafif Atmaka",
    likes: 140,
    followers: 8402,
    expLevel: 14,
    currentExp: 2450,
    maxExp: 4200,
    rank: "MASTER",
    rankPoints: 1200,
    streak: 7
  }

  // Mock mini games data
  const miniGames: MiniGame[] = [
    {
      id: 'history-heroes',
      title: 'History Heroes',
      playersCount: 742,
      image: '/games/history-hero.png',
      color: 'from-purple-500 to-purple-700',
      badge: '🏛️'
    },
    {
      id: 'language-war',
      title: 'Language War',
      playersCount: 82,
      image: '/games/language.png',
      color: 'from-blue-500 to-blue-700',
      badge: '🌍'
    },
    {
      id: 'questopia',
      title: 'Questopia',
      playersCount: 218,
      image: '/games/quest.png',
      color: 'from-primary to-primary/80',
      badge: '🧩'
    },
    {
      id: 'math-master',
      title: 'Math Master',
      playersCount: 145,
      image: '/games/math.png',
      color: 'from-amber-500 to-amber-700',
      badge: '🔢'
    }
  ]

  // Enhanced leaderboard data
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

  const pulseAnimation = {
    initial: { scale: 1 },
    animate: { 
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse" as const
      }
    }
  }
  
  const floatAnimation = {
    initial: { y: 0 },
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: "reverse" as const
      }
    }
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="container max-w-7xl mx-auto px-4 py-6 md:py-8 space-y-6 md:space-y-8"
    >
      {/* Hero Section */}
      <motion.div 
        variants={itemVariants}
        className="bg-background/95 backdrop-blur-lg rounded-2xl md:rounded-3xl border shadow-lg overflow-hidden"
      >
        <div className="relative h-auto md:h-64 lg:h-72">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-purple-500/20 to-blue-500/20">
            {/* Floating particles */}
            {mounted && [...Array(15)].map((_, i) => (
              <motion.div 
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  width: Math.random() * 8 + 2 + 'px',
                  height: Math.random() * 8 + 2 + 'px',
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.5 + 0.2
                }}
                animate={{
                  y: [0, -15, 0],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}

            {/* Path pattern */}
            <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0,50 Q25,30 50,50 T100,50" stroke="white" strokeWidth="2" fill="none" />
              <path d="M0,60 Q35,40 70,60 T100,60" stroke="white" strokeWidth="1.5" fill="none" />
              <path d="M0,40 Q45,20 90,40 T100,40" stroke="white" strokeWidth="1" fill="none" />
            </svg>
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col md:flex-row items-center md:justify-between p-6 md:p-8 gap-4 md:gap-6">
            <div className="text-center md:text-left">
              <motion.div 
                className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium mb-3 md:mb-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Flame className="h-3 w-3 md:h-4 md:w-4" /> {user.streak} Day Streak
              </motion.div>
              
              <motion.h1 
                variants={itemVariants} 
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2"
              >
                Ready for New <span className="text-primary">Quests?</span>
              </motion.h1>
              
              <motion.p 
                variants={itemVariants} 
                className="text-sm md:text-base lg:text-lg text-muted-foreground md:max-w-md"
              >
                Challenge yourself with fun quests, earn experience points and climb the ranks!
              </motion.p>
              
              <motion.div 
                variants={itemVariants}
                className="flex flex-wrap gap-3 md:gap-4 mt-3 md:mt-4 justify-center md:justify-start"
              >
                <Button size="sm" className="rounded-full bg-primary hover:bg-primary/90 gap-2 text-xs md:text-sm">
                  <Play className="h-3 w-3 md:h-4 md:w-4" /> Start Challenge
                </Button>
                <Button size="sm" variant="outline" className="rounded-full gap-2 text-xs md:text-sm">
                  Daily Rewards <Gift className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </motion.div>
            </div>

            <motion.div 
              variants={itemVariants}
              className="hidden md:block relative"
            >
              <motion.div
                animate={pulseAnimation.animate}
                initial={pulseAnimation.initial}
                className="relative"
              >
                <div className="h-40 w-40 relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl"></div>
                  <div className="relative z-10 h-full w-full flex items-center justify-center">
                    <div className="relative w-24 h-24">
                      <div className="absolute bottom-0 w-full h-3/5 bg-amber-800 rounded-md"></div>
                      
                      <motion.div 
                        className="absolute top-0 w-full h-2/5 bg-amber-700 rounded-t-md origin-bottom"
                        animate={{ rotateX: [0, -30, 0] }}
                        transition={{ 
                          duration: 3,
                          repeat: Infinity,
                          repeatDelay: 3,
                          ease: "easeInOut" 
                        }}
                      >
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-yellow-600 rounded-sm border-2 border-yellow-800"></div>
                      </motion.div>
                      
                      <motion.div
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.7, 1, 0.7]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          repeatType: "reverse"
                        }}
                      >
                        <div className="flex gap-1">
                          <div className="h-3 w-3 bg-yellow-400 rounded-full shadow-lg shadow-yellow-400/50"></div>
                          <div className="h-2 w-2 bg-blue-400 rounded-full shadow-lg shadow-blue-400/50"></div>
                          <div className="h-4 w-4 bg-primary rounded-full shadow-lg shadow-primary/50"></div>
                        </div>
                      </motion.div>
                      
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute top-1/3 left-1/2"
                          initial={{ 
                            x: Math.random() * 20 - 10,
                            y: 0,
                            opacity: 0,
                            scale: 0
                          }}
                          animate={{ 
                            y: -30,
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.6,
                            repeatDelay: Math.random() * 2
                          }}
                        >
                          <Sparkles className={`h-3 w-3 ${
                            ['text-yellow-400', 'text-primary', 'text-blue-400'][Math.floor(Math.random() * 3)]
                          }`} />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                animate={floatAnimation.animate}
                initial={floatAnimation.initial}
                className="absolute -top-4 -right-4 bg-amber-500/10 backdrop-blur-sm rounded-full p-3 shadow-lg border border-amber-500/20"
              >
                <Star className="h-6 w-6 text-amber-500" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* User Overview Section */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {/* Player Card */}
        <motion.div 
          whileHover={{ scale: 1.02, y: -5 }}
          className="bg-background/95 backdrop-blur-lg rounded-xl border p-4 md:p-6 flex items-center gap-3 md:gap-4"
        >
          <div className="relative">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center relative">
              <span className="text-base md:text-xl font-bold text-white">{user.name.charAt(0)}</span>
              <motion.div 
                className="absolute inset-0 rounded-full border-2 border-primary/30"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
              {user.expLevel}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center flex-wrap">
              <h3 className="font-semibold text-sm md:text-base truncate">{user.name}</h3>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs whitespace-nowrap">
                {user.rank}
              </Badge>
            </div>
            
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Level Progress</span>
                <span className="font-medium">{user.currentExp}/{user.maxExp} XP</span>
              </div>
              <Progress 
                value={(user.currentExp / user.maxExp) * 100} 
                className="h-1.5"
              />
            </div>
            
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" /> {user.followers}
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3" /> {user.likes}
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Streak Card */}
        <motion.div 
          whileHover={{ scale: 1.02, y: -5 }}
          className="bg-background/95 backdrop-blur-lg rounded-xl border p-4 md:p-6"
        >
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm md:text-base">
            <Flame className="h-4 w-4 text-red-500" /> Your Streak
          </h3>
          
          <div className="flex justify-between mb-3">
            {[...Array(7)].map((_, index) => (
              <motion.div 
                key={index}
                className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center ${index < user.streak ? 'bg-amber-500 text-white' : 'bg-muted'}`}
                whileHover={{ scale: 1.1 }}
              >
                {index < user.streak ? (
                  <Sparkles className="h-3 w-3 md:h-4 md:w-4" />
                ) : (
                  <span className="text-xs">{index + 1}</span>
                )}
              </motion.div>
            ))}
          </div>
          
          <div className="text-center">
            <p className="text-xs md:text-sm text-muted-foreground">You're on a {user.streak} day streak!</p>
            <Button variant="ghost" size="sm" className="mt-2 gap-1 text-xs">
              <Flag className="h-3 w-3" /> Keep going
            </Button>
          </div>
        </motion.div>
        
        {/* Rank Card */}
        <motion.div 
          whileHover={{ scale: 1.02, y: -5 }}
          className="bg-background/95 backdrop-blur-lg rounded-xl border p-4 md:p-6 sm:col-span-2 md:col-span-1"
        >
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm md:text-base">
            <Trophy className="h-4 w-4 text-amber-500" /> Your Rank
          </h3>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex flex-col items-center">
              <motion.div 
                className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/10 flex items-center justify-center"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
              >
                <Trophy className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </motion.div>
              <div className="text-xs mt-1 text-muted-foreground text-center">Your Position</div>
            </div>
            
            <div className="text-2xl md:text-3xl font-bold text-primary">
              {leaderboard.findIndex(l => l.name === user.name) + 1 || 4}
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-xs md:text-sm text-muted-foreground">Rank points: <span className="font-medium text-foreground">{user.rankPoints}</span></p>
            <Button variant="outline" size="sm" className="mt-3 gap-1 rounded-full text-xs">
              View Leaderboard <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </motion.div>
      </motion.div>

      {/* Mini Games Section */}
      <motion.div variants={itemVariants}>
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-bold">Interactive Games</h2>
          <Button variant="ghost" size="sm" className="gap-1 text-xs md:text-sm">
            Browse All <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {miniGames.map((game, index) => (
            <motion.div 
              key={game.id}
              variants={itemVariants}
              whileHover={{ scale: 1.03, y: -5 }}
              className={`bg-gradient-to-br ${game.color} rounded-xl overflow-hidden border border-white/10 shadow-lg cursor-pointer`}
              onClick={() => setSelectedGame(game.id === selectedGame ? null : game.id)}
            >
              <div className="h-36 md:h-44 relative p-4 md:p-6 text-white">
                {/* Game badge */}
                <motion.div 
                  className="text-3xl md:text-4xl absolute top-4 right-4"
                  animate={{ 
                    y: [0, -5, 0],
                    rotate: [0, 5, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.2 
                  }}
                >
                  {game.badge}
                </motion.div>
                
                <div className="absolute inset-0 overflow-hidden">
                  {mounted && [...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-white rounded-full opacity-20"
                      style={{
                        left: `${Math.random() * 100}%`, 
                        top: `${Math.random() * 100}%`
                      }}
                      animate={{
                        y: [0, -20],
                        opacity: [0.2, 0]
                      }}
                      transition={{
                        duration: Math.random() * 2 + 1,
                        repeat: Infinity,
                        repeatType: "loop"
                      }}
                    />
                  ))}
                </div>
                
                <div className="relative z-10">
                  <h3 className="text-lg md:text-xl font-bold mb-1">{game.title}</h3>
                  <div className="flex items-center text-xs md:text-sm space-x-1 mb-3">
                    <Users className="h-3 w-3" /> 
                    <span>{game.playersCount} playing now</span>
                  </div>
                  
                  <AnimatePresence>
                    {selectedGame === game.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs md:text-sm"
                      >
                        <p className="mb-2">Quick match with other players in a fun, educational game.</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <Button 
                    size="sm" 
                    className="mt-2 bg-white/20 hover:bg-white/30 text-white border-white/10 rounded-full text-xs"
                  >
                    <Play className="h-3 w-3 mr-1" /> Play Now
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Daily Quests & Leaderboard Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Quests */}
        <motion.div variants={itemVariants}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <Flag className="h-4 w-4 md:h-5 md:w-5 text-primary" /> Daily Quests
            </h2>
            <Button variant="outline" size="sm" className="rounded-full text-xs">
              Claim All
            </Button>
          </div>
          
          <div className="space-y-4">
            {dailyQuests.map(quest => (
              <motion.div
                key={quest.id}
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-background/95 backdrop-blur-lg rounded-xl border p-4 md:p-5 transition-all"
              >
                <div className="flex items-center gap-3 md:gap-4 mb-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl md:text-2xl">
                    {quest.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm md:text-base truncate">{quest.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Sparkles className="h-3 w-3 text-amber-500" />
                      <span className="text-xs md:text-sm text-amber-500 font-medium">+{quest.exp} XP</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span>{quest.progress}%</span>
                    </div>
                    <Progress value={quest.progress} className="h-1.5" />
                  </div>
                  
                  <Button 
                    size="sm"
                    disabled={quest.progress < 100}
                    className={`rounded-full px-3 md:px-4 text-xs ${quest.progress < 100 ? 'opacity-70' : ''}`}
                  >
                    Claim
                  </Button>
                </div>
              </motion.div>
            ))}
            
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-primary/20 to-primary/5 rounded-xl p-4 md:p-5 flex justify-between items-center"
            >
              <div className="flex items-center gap-2 md:gap-3">
                <BookOpen className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <span className="font-medium text-sm md:text-base">More quests coming soon!</span>
              </div>
              <span className="text-xs text-muted-foreground">Tomorrow</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Enhanced Leaderboard */}
        <motion.div variants={itemVariants}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <Trophy className="h-4 w-4 md:h-5 md:w-5 text-amber-500" /> Leaderboard
            </h2>
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              View All <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="bg-background/95 backdrop-blur-lg rounded-xl border p-4 md:p-6 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute -right-20 -top-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl"></div>
            
            {/* Animated trophy or crown at top */}
            {mounted && (
              <motion.div 
                className="absolute top-4 right-4 opacity-10"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 8, repeat: Infinity }}
              >
                <Crown className="h-16 w-16 text-amber-500" />
              </motion.div>
            )}
            
            <div className="relative z-10">
              {/* Leaderboard header */}
              <div className="flex items-center justify-between py-2 px-2 mb-3 text-xs md:text-sm border-b border-muted">
                <div className="w-8 md:w-12 font-semibold text-center">#</div>
                <div className="flex-1 font-semibold">Player</div>
                <div className="w-16 md:w-24 font-semibold text-right">Points</div>
              </div>
              
              <div className="space-y-2">
                {/* Leaderboard entries */}
                {leaderboard.map((player, index) => (
                  <motion.div
                    key={player.id}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="flex items-center gap-2 md:gap-4 p-2 md:p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-8 md:w-12 flex justify-center">
                      {index === 0 && (
                        <motion.div 
                          animate={{ 
                            scale: [1, 1.1, 1],
                            boxShadow: [
                              "0 0 0 rgba(245, 158, 11, 0.4)",
                              "0 0 20px rgba(245, 158, 11, 0.7)",
                              "0 0 0 rgba(245, 158, 11, 0.4)"
                            ]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="bg-amber-500 text-white w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center"
                        >
                          <Crown className="h-3 w-3 md:h-4 md:w-4" />
                        </motion.div>
                      )}
                      {index === 1 && (
                        <div className="bg-zinc-400 text-white w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center">
                          2
                        </div>
                      )}
                      {index === 2 && (
                        <div className="bg-amber-700 text-white w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center">
                          3
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                        <span className="text-base md:text-lg font-medium text-primary">
                          {player.name.charAt(0)}
                        </span>
                      </div>
                      
                      <div className="flex flex-col min-w-0">
                        <h3 className="font-medium text-sm md:text-base truncate">{player.name}</h3>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-xs px-1">
                            {player.rank}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-16 md:w-24 text-right">
                      <div className="text-base md:text-lg font-bold text-primary flex items-center justify-end gap-1">
                        {player.points.toLocaleString()}
                        <span className="text-xs text-muted-foreground ml-1">pts</span>
                      </div>
                      
                      {/* Trending indicator */}
                      <div className="flex items-center justify-end gap-0.5 text-xs text-emerald-500">
                        <ArrowUp className="h-3 w-3" />
                        <span>2%</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {/* Current user position */}
                <motion.div
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="flex items-center gap-2 md:gap-4 p-2 md:p-3 rounded-lg border border-dashed border-primary/20 bg-primary/5"
                >
                  <div className="w-8 md:w-12 flex justify-center">
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-muted flex items-center justify-center font-bold text-xs md:text-sm">
                      4
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <motion.div 
                      animate={{
                        boxShadow: [
                          "0 0 0 rgba(124, 58, 237, 0)",
                          "0 0 8px rgba(124, 58, 237, 0.5)",
                          "0 0 0 rgba(124, 58, 237, 0)"
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center"
                    >
                      <span className="text-base md:text-lg font-medium text-white">
                        {user.name.charAt(0)}
                      </span>
                    </motion.div>
                    
                    <div className="flex flex-col min-w-0">
                      <h3 className="font-medium text-sm md:text-base truncate">You</h3>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs px-1">
                          {user.rank}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-16 md:w-24 text-right">
                    <div className="text-base md:text-lg font-bold text-primary flex items-center justify-end gap-1">
                      {user.rankPoints.toLocaleString()}
                      <span className="text-xs text-muted-foreground ml-1">pts</span>
                    </div>
                    
                    {/* Need more points indicator */}
                    <div className="flex items-center justify-end gap-0.5 text-xs text-amber-500">
                      <span>{(leaderboard[2].points - user.rankPoints).toLocaleString()} to rank up</span>
                    </div>
                  </div>
                </motion.div>
              </div>
              
              {/* Encouraging message */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="mt-4 text-center bg-primary/5 rounded-lg py-2 text-xs md:text-sm"
              >
                <p>Complete daily quests to earn more points!</p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
} 