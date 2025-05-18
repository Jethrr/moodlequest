'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge" 
import { useQuests } from "@/hooks/use-quests"
import QuestForm from "@/components/quests/quest-form"
import QuestsList from "@/components/quests/quests-list"
import { motion, AnimatePresence } from "framer-motion"
import { useTeacherProtection } from "@/hooks/use-role-protection"
import { 
  PlusCircle, 
  BarChart, 
  Users, 
  BookOpen, 
  Calendar, 
  Award, 
  TrendingUp,
  Bell,
  CheckCircle,
  FileText,
  Lightbulb,
  Star,
  ArrowRight,
  Sparkles
} from "lucide-react"

export default function TeacherDashboard() {
  // Protect this route for teachers - students will be redirected to /dashboard
  useTeacherProtection("/dashboard");
  
  const [isCreating, setIsCreating] = useState(false)
  const { data: quests, isLoading, error } = useQuests()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("quests")
  
  // Mock data for teacher dashboard
  const dashboardStats = {
    totalStudents: 342,
    activeQuests: quests?.length || 0,
    completionRate: 78,
    avgScore: 82,
    questsToReview: 8,
    studentsOnline: 42,
    teacherRating: 4.8,
  }
  
  const recentActivity = [
    { id: 1, student: "Alex Kim", action: "completed", quest: "History Quiz", time: "10 min ago" },
    { id: 2, student: "Jamie Smith", action: "started", quest: "Science Challenge", time: "25 min ago" },
    { id: 3, student: "Taylor Wong", action: "submitted", quest: "Math Problem Set", time: "1 hour ago" },
  ]
  
  const topPerformers = [
    { id: 1, name: "Maya Johnson", quests: 24, score: 96, avatar: "M" },
    { id: 2, name: "Daniel Lee", quests: 22, score: 94, avatar: "D" },
    { id: 3, name: "Sophia Garcia", quests: 21, score: 92, avatar: "S" },
  ]

  // Client-side mounting detection
  useEffect(() => {
    setMounted(true)
  }, [])

  // Animation variants
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

  const floatAnimation = {
    initial: { y: 0 },
    animate: {
      y: [0, -8, 0],
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
      className="container mx-auto px-4 py-6 md:py-8 space-y-6 md:space-y-8"
    >
      {/* Hero Section */}
      <motion.div 
        variants={itemVariants}
        className="bg-background/95 backdrop-blur-lg rounded-2xl md:rounded-3xl border shadow-lg overflow-hidden"
      >
        <div className="relative h-auto md:h-48">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/10 to-blue-500/10">
            {/* Floating particles */}
            {mounted && [...Array(10)].map((_, i) => (
              <motion.div 
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  width: Math.random() * 6 + 2 + 'px',
                  height: Math.random() * 6 + 2 + 'px',
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.3 + 0.1
                }}
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
            
            {/* Path pattern */}
            <svg className="absolute inset-0 w-full h-full opacity-5" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0,50 Q25,30 50,50 T100,50" stroke="white" strokeWidth="2" fill="none" />
              <path d="M0,60 Q35,40 70,60 T100,60" stroke="white" strokeWidth="1.5" fill="none" />
              <path d="M0,40 Q45,20 90,40 T100,40" stroke="white" strokeWidth="1" fill="none" />
            </svg>
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col md:flex-row items-center md:items-start md:justify-between p-6 md:p-8">
            <div>
              <motion.h1 
                variants={itemVariants} 
                className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-2"
              >
                Teacher <span className="text-primary">Dashboard</span>
              </motion.h1>
              <motion.p 
                variants={itemVariants} 
                className="text-sm md:text-base text-muted-foreground max-w-md"
              >
                Craft engaging quests, track student progress, and build an interactive learning experience
              </motion.p>
            </div>
            
            <motion.div 
              variants={itemVariants}
              className="mt-4 md:mt-0"
            >
              <Button 
                onClick={() => setIsCreating(true)} 
                size="lg" 
                className="rounded-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <PlusCircle className="h-4 w-4" /> Create New Quest
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
      
      {/* Stats Overview Section */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <motion.div 
          whileHover={{ scale: 1.02, y: -5 }}
          className="bg-background/95 backdrop-blur-lg rounded-xl border p-4 flex flex-col"
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Students</h3>
            <div className="bg-primary/10 p-1.5 rounded-md">
              <Users className="h-3.5 w-3.5 text-primary" />
            </div>
          </div>
          <div className="text-2xl font-bold">{dashboardStats.totalStudents}</div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-emerald-500" /> 
            <span>+12% from last month</span>
          </div>
        </motion.div>
        
        <motion.div 
          whileHover={{ scale: 1.02, y: -5 }}
          className="bg-background/95 backdrop-blur-lg rounded-xl border p-4 flex flex-col"
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Active Quests</h3>
            <div className="bg-blue-500/10 p-1.5 rounded-md">
              <BookOpen className="h-3.5 w-3.5 text-blue-500" />
            </div>
          </div>
          <div className="text-2xl font-bold">{dashboardStats.activeQuests}</div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <span>{dashboardStats.questsToReview} quests to review</span>
          </div>
        </motion.div>
        
        <motion.div 
          whileHover={{ scale: 1.02, y: -5 }}
          className="bg-background/95 backdrop-blur-lg rounded-xl border p-4 flex flex-col"
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Completion Rate</h3>
            <div className="bg-emerald-500/10 p-1.5 rounded-md">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
            </div>
          </div>
          <div className="text-2xl font-bold">{dashboardStats.completionRate}%</div>
          <Progress value={dashboardStats.completionRate} className="h-1.5 mt-2" />
        </motion.div>
        
        <motion.div 
          whileHover={{ scale: 1.02, y: -5 }}
          className="bg-background/95 backdrop-blur-lg rounded-xl border p-4 flex flex-col"
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Average Score</h3>
            <div className="bg-amber-500/10 p-1.5 rounded-md">
              <Award className="h-3.5 w-3.5 text-amber-500" />
            </div>
          </div>
          <div className="text-2xl font-bold">{dashboardStats.avgScore}</div>
          <div className="mt-1.5 flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star}
                className={`h-3 w-3 ${star <= Math.round(dashboardStats.teacherRating) ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
      
      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Quest Management */}
        <motion.div 
          variants={itemVariants} 
          className="md:col-span-2 space-y-6"
        >
          {/* Quest Management Card */}
          <div className="bg-background/95 backdrop-blur-lg rounded-xl border shadow-md">
            <div className="border-b px-4 py-3">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Quest Management
                </h2>
                {!isCreating && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs gap-1"
                    onClick={() => setIsCreating(true)}
                  >
                    <PlusCircle className="h-3.5 w-3.5" /> New Quest
                  </Button>
                )}
              </div>
            </div>
            
            <div className="p-4">
              <AnimatePresence mode="wait">
                {isCreating ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <QuestForm
                      onCancel={() => setIsCreating(false)}
                      onSuccess={() => setIsCreating(false)}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <QuestsList quests={quests || []} isLoading={isLoading} error={error} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          {/* Analytics Preview */}
          <div className="bg-background/95 backdrop-blur-lg rounded-xl border shadow-md p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <BarChart className="h-4 w-4 text-blue-500" />
                Analytics Preview
              </h2>
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                Full Report <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1 text-sm">
                  <span>Engagement Rate</span>
                  <span className="font-medium">84%</span>
                </div>
                <Progress value={84} className="h-1.5" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1 text-sm">
                  <span>Quest Completion</span>
                  <span className="font-medium">{dashboardStats.completionRate}%</span>
                </div>
                <Progress value={dashboardStats.completionRate} className="h-1.5" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1 text-sm">
                  <span>Learning Objectives Met</span>
                  <span className="font-medium">91%</span>
                </div>
                <Progress value={91} className="h-1.5" />
              </div>
            </div>
            
            <div className="mt-4 bg-muted/50 rounded-lg p-3 flex items-center gap-3">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              <p className="text-xs text-muted-foreground">Students perform 32% better on interactive quests compared to traditional assignments.</p>
            </div>
          </div>
        </motion.div>
        
        {/* Right Column - Activity & Top Performers */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Recent Activity */}
          <div className="bg-background/95 backdrop-blur-lg rounded-xl border shadow-md">
            <div className="border-b px-4 py-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                Recent Activity
              </h2>
            </div>
            
            <div className="p-2">
              {recentActivity.map((activity) => (
                <motion.div 
                  key={activity.id}
                  whileHover={{ scale: 1.01, x: 2 }}
                  className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-medium text-primary">
                      {activity.student.charAt(0)}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.student}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.action} "<span className="text-primary">{activity.quest}</span>"
                    </p>
                  </div>
                  
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </motion.div>
              ))}
              
              <div className="px-2 pt-2">
                <Button variant="ghost" size="sm" className="w-full text-xs gap-1">
                  View All Activity <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Top Performers */}
          <div className="bg-background/95 backdrop-blur-lg rounded-xl border shadow-md">
            <div className="border-b px-4 py-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-500" />
                Top Performers
              </h2>
            </div>
            
            <div className="p-2">
              {topPerformers.map((student, index) => (
                <motion.div 
                  key={student.id}
                  whileHover={{ scale: 1.01, x: 2 }}
                  className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg"
                >
                  <div className="relative">
                    <div className={`w-8 h-8 rounded-full ${
                      index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-zinc-400' : 'bg-amber-700'
                    } flex items-center justify-center`}>
                      <span className="text-xs font-medium text-white">
                        {student.avatar}
                      </span>
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-background flex items-center justify-center text-[10px] font-bold ${
                      index === 0 ? 'text-amber-500' : index === 1 ? 'text-zinc-400' : 'text-amber-700'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{student.name}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">{student.quests} quests</span>
                      <span className="flex items-center gap-0.5 text-amber-500">
                        <Sparkles className="h-3 w-3" /> {student.score}%
                      </span>
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm" className="h-7 text-xs rounded-full">
                    View
                  </Button>
                </motion.div>
              ))}
              
              <div className="px-2 pt-2">
                <Button variant="ghost" size="sm" className="w-full text-xs gap-1">
                  View All Students <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Quick Resources */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-primary/20 to-primary/5 rounded-xl p-4 flex flex-col gap-3 items-center text-center"
          >
            <motion.div
              animate={floatAnimation.animate}
              initial={floatAnimation.initial}
              className="bg-primary/10 p-3 rounded-full"
            >
              <Lightbulb className="h-6 w-6 text-primary" />
            </motion.div>
            
            <div>
              <h3 className="font-medium text-sm mb-1">Need help creating quests?</h3>
              <p className="text-xs text-muted-foreground">Access templates, guides and best practices</p>
            </div>
            
            <Button size="sm" variant="outline" className="text-xs rounded-full bg-background/50">
              View Resources
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
} 