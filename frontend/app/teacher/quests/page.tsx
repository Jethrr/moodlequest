'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs' 
import { useQuests } from '@/hooks/use-quests'
import QuestForm from '@/components/quests/quest-form'
import QuestsList from '@/components/quests/quests-list'
import {
  Search,
  PlusCircle,
  BookOpen,
  Users,
  CheckCircle,
  Award,
  FileText,
  Sparkles,
  Clock,
  ArrowRight,
  BarChart,
  Star,
  Edit,
  ArrowUpRight,
  Layers,
  Filter,
  SortAsc,
  SlidersHorizontal,
  Trash
} from 'lucide-react'

export default function TeacherQuestsPage() {
  const [isCreating, setIsCreating] = useState(false)
  const [selectedQuest, setSelectedQuest] = useState<string | null>(null)
  const { data: quests, isLoading, error } = useQuests()
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [mounted, setMounted] = useState(false)

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  // Mock data
  const questTypes = [
    { id: 'quiz', name: 'Quiz', count: 12, icon: <FileText className="h-3.5 w-3.5" /> },
    { id: 'challenge', name: 'Challenge', count: 8, icon: <Sparkles className="h-3.5 w-3.5" /> },
    { id: 'assessment', name: 'Assessment', count: 5, icon: <Layers className="h-3.5 w-3.5" /> },
  ]

  const recentSubmissions = [
    { id: 1, student: 'Emma Wilson', quest: 'Biology Quiz', score: 92, time: '2 hours ago' },
    { id: 2, student: 'Aarav Patel', quest: 'Math Challenge', score: 87, time: '4 hours ago' },
    { id: 3, student: 'Olivia Chen', quest: 'History Assessment', score: 95, time: '5 hours ago' },
  ]

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
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-blue-500/10 to-violet-500/10">
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
                Quest <span className="text-primary">Management</span>
              </motion.h1>
              <motion.p 
                variants={itemVariants} 
                className="text-sm md:text-base text-muted-foreground max-w-md"
              >
                Create, edit and manage learning quests for your students
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
      
      {/* Quest Stats Summary */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <motion.div 
          whileHover={{ scale: 1.02, y: -5 }}
          className="bg-background/95 backdrop-blur-lg rounded-xl border p-4 flex flex-col"
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Total Quests</h3>
            <div className="bg-primary/10 p-1.5 rounded-md">
              <FileText className="h-3.5 w-3.5 text-primary" />
            </div>
          </div>
          <div className="text-2xl font-bold">{quests?.length || 0}</div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <span>{isLoading ? 'Loading...' : 'Across all classes'}</span>
          </div>
        </motion.div>
        
        <motion.div 
          whileHover={{ scale: 1.02, y: -5 }}
          className="bg-background/95 backdrop-blur-lg rounded-xl border p-4 flex flex-col"
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Students Engaged</h3>
            <div className="bg-blue-500/10 p-1.5 rounded-md">
              <Users className="h-3.5 w-3.5 text-blue-500" />
            </div>
          </div>
          <div className="text-2xl font-bold">278</div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <span>42 currently active</span>
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
          <div className="text-2xl font-bold">84%</div>
          <Progress value={84} className="h-1.5 mt-2" />
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
          <div className="text-2xl font-bold">86</div>
          <div className="mt-1.5 flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star}
                className={`h-3 w-3 ${star <= 4 ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Quest Management */}
        <motion.div variants={itemVariants} className="md:col-span-2 space-y-6">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search quests..." 
                className="pl-9" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1 h-10">
                <Filter className="h-4 w-4" /> Filter
              </Button>
              <Button variant="outline" size="sm" className="gap-1 h-10">
                <SortAsc className="h-4 w-4" /> Sort
              </Button>
              <Button variant="outline" size="sm" className="gap-1 h-10 sm:hidden">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Quest Type Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full mb-4 bg-muted/50 p-1 h-auto flex flex-wrap">
              <TabsTrigger value="all" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-1.5">
                All Quests ({quests?.length || 0})
              </TabsTrigger>
              {questTypes.map(type => (
                <TabsTrigger 
                  key={type.id} 
                  value={type.id}
                  className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-1.5 gap-1"
                >
                  {type.icon} {type.name} ({type.count})
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value="all" className="m-0">
              {/* Create Quest Form */}
              <AnimatePresence mode="wait">
                {isCreating ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-background/95 backdrop-blur-lg rounded-xl border shadow-md p-4"
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
                    {/* Quest List */}
                    <div className="space-y-4">
                      {(quests || []).slice(0, 4).map((quest: any) => (
                        <motion.div
                          key={quest.id}
                          whileHover={{ scale: 1.01, x: 5 }}
                          className="bg-background/95 backdrop-blur-lg rounded-xl border shadow-sm p-4 flex flex-col md:flex-row md:items-center gap-4"
                        >
                          <div className="bg-primary/10 rounded-lg p-3 flex items-center justify-center shrink-0">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-medium text-base">{quest.title}</h3>
                              <Badge variant="outline" className="bg-blue-500/10 text-blue-500 text-xs">
                                {quest.type || 'Quiz'}
                              </Badge>
                            </div>

                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {quest.description || 'No description provided.'}
                            </p>

                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" /> 48 students
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {quest.duration || '20'} min
                              </div>
                              <div className="flex items-center gap-1">
                                <Sparkles className="h-3 w-3" /> {quest.xp || '150'} XP
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 justify-end md:flex-col">
                            <Button variant="outline" size="sm" className="gap-1 text-xs rounded-full">
                              <Edit className="h-3 w-3" /> Edit
                            </Button>
                            <Button variant="ghost" size="sm" className="gap-1 text-xs rounded-full">
                              <Trash className="h-3 w-3 text-red-500" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}

                      {/* Load more button */}
                      <div className="flex justify-center mt-4">
                        <Button variant="outline" size="sm" className="gap-1 text-xs">
                          View All Quests <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>
            
            {/* Tab content for other quest types */}
            {questTypes.map(type => (
              <TabsContent key={type.id} value={type.id} className="m-0">
                <div className="bg-background/95 backdrop-blur-lg rounded-xl border p-6 text-center">
                  <div className="mx-auto bg-muted/50 rounded-full w-12 h-12 flex items-center justify-center mb-3">
                    {type.icon}
                  </div>
                  <h3 className="font-medium mb-2">{type.name} Quests</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Showing {type.count} {type.name.toLowerCase()} quests
                  </p>
                  <Button 
                    variant="default" 
                    onClick={() => setIsCreating(true)}
                    size="sm"
                    className="gap-1 text-xs"
                  >
                    <PlusCircle className="h-3 w-3" /> Create {type.name}
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
          
          {/* Quick Analytics */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-background/95 backdrop-blur-lg rounded-xl border shadow-md p-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <BarChart className="h-4 w-4 text-blue-500" />
                Quest Performance
              </h2>
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                See Analytics <ArrowUpRight className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-muted/50 rounded-lg p-3">
                <h3 className="text-sm font-medium mb-2 flex items-center justify-between">
                  <span>Most Completed</span>
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                </h3>
                <p className="text-xs font-medium line-clamp-2">Chemistry Basics Quiz</p>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Completion Rate</span>
                  <span className="font-medium">96%</span>
                </div>
                <Progress value={96} className="h-1 mt-1" />
              </div>
              
              <div className="bg-muted/50 rounded-lg p-3">
                <h3 className="text-sm font-medium mb-2 flex items-center justify-between">
                  <span>Most Engaging</span>
                  <Users className="h-3.5 w-3.5 text-blue-500" />
                </h3>
                <p className="text-xs font-medium line-clamp-2">History Mystery Challenge</p>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Engagement Score</span>
                  <span className="font-medium">92%</span>
                </div>
                <Progress value={92} className="h-1 mt-1" />
              </div>
              
              <div className="bg-muted/50 rounded-lg p-3">
                <h3 className="text-sm font-medium mb-2 flex items-center justify-between">
                  <span>Needs Attention</span>
                  <Award className="h-3.5 w-3.5 text-amber-500" />
                </h3>
                <p className="text-xs font-medium line-clamp-2">Advanced Math Problems</p>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Average Score</span>
                  <span className="font-medium">62%</span>
                </div>
                <Progress value={62} className="h-1 mt-1" />
              </div>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Right Column - Recent Submissions & Quick Actions */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Recent Submissions */}
          <div className="bg-background/95 backdrop-blur-lg rounded-xl border shadow-md">
            <div className="border-b px-4 py-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Recent Submissions
              </h2>
            </div>
            
            <div className="p-2">
              {recentSubmissions.map((submission) => (
                <motion.div 
                  key={submission.id}
                  whileHover={{ scale: 1.01, x: 2 }}
                  className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-medium text-primary">
                      {submission.student.charAt(0)}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{submission.student}</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-primary">{submission.quest}</span>
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    <Badge className={`${
                      submission.score >= 90 ? 'bg-emerald-500' : 
                      submission.score >= 70 ? 'bg-amber-500' : 'bg-red-500'
                    } text-white text-xs`}>
                      {submission.score}%
                    </Badge>
                    <span className="text-xs text-muted-foreground">{submission.time}</span>
                  </div>
                </motion.div>
              ))}
              
              <div className="px-2 pt-2">
                <Button variant="ghost" size="sm" className="w-full text-xs gap-1">
                  View All Submissions <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* To Review */}
          <div className="bg-background/95 backdrop-blur-lg rounded-xl border shadow-md">
            <div className="border-b px-4 py-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                To Review
              </h2>
            </div>
            
            <div className="p-4 text-center">
              <div className="relative mx-auto w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl font-bold text-primary">8</span>
                <motion.div 
                  className="absolute inset-0 rounded-full border-2 border-primary/30"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              
              <h3 className="font-medium mb-1">Pending Reviews</h3>
              <p className="text-xs text-muted-foreground mb-3">Open-ended questions that require your feedback</p>
              
              <Button size="sm" className="gap-1 text-xs">
                Start Reviewing <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          {/* Quick Templates */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-primary/20 to-primary/5 rounded-xl p-4 flex flex-col gap-3"
          >
            <h3 className="font-medium">Quest Templates</h3>
            
            <div className="space-y-2">
              <motion.div 
                whileHover={{ x: 3 }}
                className="bg-background/60 rounded-lg p-3 flex items-center gap-3 cursor-pointer"
              >
                <div className="bg-blue-500/10 p-2 rounded-md">
                  <FileText className="h-4 w-4 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Multiple Choice Quiz</p>
                  <p className="text-xs text-muted-foreground">Quick assessment</p>
                </div>
                <Button size="icon" variant="ghost" className="h-7 w-7">
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </motion.div>
              
              <motion.div 
                whileHover={{ x: 3 }}
                className="bg-background/60 rounded-lg p-3 flex items-center gap-3 cursor-pointer"
              >
                <div className="bg-amber-500/10 p-2 rounded-md">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Challenge Game</p>
                  <p className="text-xs text-muted-foreground">Interactive mission</p>
                </div>
                <Button size="icon" variant="ghost" className="h-7 w-7">
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </motion.div>
              
              <motion.div 
                whileHover={{ x: 3 }}
                className="bg-background/60 rounded-lg p-3 flex items-center gap-3 cursor-pointer"
              >
                <div className="bg-emerald-500/10 p-2 rounded-md">
                  <BookOpen className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Essay Assessment</p>
                  <p className="text-xs text-muted-foreground">Long-form answers</p>
                </div>
                <Button size="icon" variant="ghost" className="h-7 w-7">
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
} 