'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { 
  BookOpen, 
  Trophy, 
  Star, 
  Award, 
  Clock, 
  Video, 
  BarChart4, 
  MapPin,
  Briefcase,
  Calendar,
  GraduationCap
} from "lucide-react"
import { fetchUserProfile, ProfileData as MoodleProfileData } from '@/lib/profile-service'
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

// Define types for our profile data
interface Badge {
  id: number | string;
  name: string;
  icon: string;
  color: string;
  locked?: boolean;
}

interface Certificate {
  id: number | string;
  title: string;
  score: number;
  date: string;
}

interface ProfileStats {
  finished_skills: number;
  watched_workflows: number;
  viewed_time: string;
  courses_completed: number;
  quests_completed: number;
  exp_points: number;
}

interface RankingInfo {
  position: number;
  total_students: number;
}

interface ProfileData {
  id: string;
  username: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  profile_image_url?: string;
  role?: string;
  level?: number;
  learning_score?: number;
  joined_date?: string;
  school?: string;
  department?: string;
  badges_collected: Badge[];
  stats?: ProfileStats;
  certificates: Certificate[];
  ranking?: RankingInfo;
}

export function ProfileContent() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchUserProfile(user);
      if (data) {
        // Convert from MoodleProfileData to our component's ProfileData format
        setProfileData(data as unknown as ProfileData);
      } else {
        setError("Could not load profile data");
      }
    } catch (e) {
      console.error("Error fetching profile data:", e);
      setError(e instanceof Error ? e.message : "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchProfile();
  }, [user]);

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

  const cardHoverVariants = {
    hover: {
      scale: 1.02,
      boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  }

  // If there was an error, show an error message with retry button
  if (error && !loading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="ml-2">Error loading profile</AlertTitle>
          <AlertDescription className="ml-2">{error}</AlertDescription>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2" 
            onClick={fetchProfile}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </Alert>
      </div>
    );
  }

  // Show skeleton loading state
  if (loading || !profileData) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="bg-background/95 backdrop-blur-lg rounded-xl border p-6 md:p-8 flex flex-col md:flex-row gap-6 animate-pulse">
          <div className="flex flex-col items-center md:items-start gap-4">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-10 w-28" />
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-40 rounded-xl" />
            <div className="col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-6">
            <Skeleton className="h-60 rounded-xl" />
            <Skeleton className="h-60 rounded-xl" />
          </div>
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-60 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Calculate level progress
  const currentLevelExp = profileData.stats?.exp_points ? Math.floor(profileData.stats.exp_points / 1000) * 1000 : 0;
  const nextLevelExp = currentLevelExp + 1000;
  const progressToNextLevel = profileData.stats?.exp_points ?
    ((profileData.stats.exp_points - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100 : 0;
  
  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="container max-w-7xl mx-auto px-4 py-8 space-y-8"
    >
      {/* Profile Header */}
      <motion.div 
        variants={itemVariants}
        className="bg-background/95 backdrop-blur-lg rounded-xl border p-6 md:p-8 flex flex-col md:flex-row gap-6"
      >
        <div className="flex flex-col items-center md:items-start gap-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="relative"
          >
            <Avatar className="h-24 w-24 border-4 border-primary/20">
              <AvatarImage src={profileData.profile_image_url} />
              <AvatarFallback className="bg-primary/10 text-3xl">
                {profileData.first_name?.[0] || ''}
                {profileData.last_name?.[0] || ''}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 bg-primary text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center">
              {profileData.level || 1}
            </div>
          </motion.div>
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold">{profileData.first_name} {profileData.last_name}</h1>
            <p className="text-muted-foreground">@{profileData.username}</p>
            <div className="mt-1">
              <Badge variant="secondary" className="font-medium capitalize">
                {profileData.role || 'student'}
              </Badge>
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium transition-colors"
          >
            Edit profile
          </motion.button>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Learning Score */}
          <motion.div 
            variants={{...itemVariants, hover: cardHoverVariants.hover}}
            whileHover="hover"
            className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 flex flex-col items-center justify-center"
          >
            <motion.div 
              initial={{ rotate: -90 }}
              animate={{ rotate: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
              className="relative w-24 h-24 mb-2"
            >
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle 
                  cx="50" cy="50" r="45" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="8"
                  strokeLinecap="round"
                  className="text-primary/10"
                />
                <motion.circle 
                  cx="50" cy="50" r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="283"
                  initial={{ strokeDashoffset: 283 }}
                  animate={{ strokeDashoffset: 283 - (283 * (profileData.learning_score || 0) / 5) }}
                  transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                  className="text-primary"
                  transform="rotate(-90 50 50)"
                />
                <text 
                  x="50" 
                  y="55" 
                  fontFamily="sans-serif" 
                  fontSize="18" 
                  textAnchor="middle" 
                  fontWeight="bold"
                >
                  {profileData.learning_score || 0}
                </text>
              </svg>
            </motion.div>
            <h3 className="font-semibold">Learning score</h3>
            <p className="text-xs text-muted-foreground text-center mt-1">
              Get better grades on upcoming skills to improve your score
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            variants={itemVariants}
            className="col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            <motion.div 
              whileHover={{ scale: 1.03 }}
              className="bg-background rounded-xl p-4 border flex flex-col items-center"
            >
              <div className="rounded-full bg-blue-100 p-2 mb-2">
                <GraduationCap className="h-5 w-5 text-blue-500" />
              </div>
              <div className="text-xl font-bold">{profileData.stats?.finished_skills || 0}</div>
              <div className="text-xs text-muted-foreground text-center">Finished skills</div>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.03 }}
              className="bg-background rounded-xl p-4 border flex flex-col items-center"
            >
              <div className="rounded-full bg-amber-100 p-2 mb-2">
                <Video className="h-5 w-5 text-amber-500" />
              </div>
              <div className="text-xl font-bold">{profileData.stats?.watched_workflows || 0}</div>
              <div className="text-xs text-muted-foreground text-center">Watched workflows</div>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.03 }}
              className="bg-background rounded-xl p-4 border flex flex-col items-center"
            >
              <div className="rounded-full bg-emerald-100 p-2 mb-2">
                <Clock className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="text-xl font-bold">{profileData.stats?.viewed_time || '0min'}</div>
              <div className="text-xs text-muted-foreground text-center">Viewed time</div>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.03 }}
              className="bg-background rounded-xl p-4 border flex flex-col items-center"
            >
              <div className="rounded-full bg-violet-100 p-2 mb-2">
                <BookOpen className="h-5 w-5 text-violet-500" />
              </div>
              <div className="text-xl font-bold">{profileData.stats?.courses_completed || 0}</div>
              <div className="text-xs text-muted-foreground text-center">Courses completed</div>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.03 }}
              className="bg-background rounded-xl p-4 border flex flex-col items-center"
            >
              <div className="rounded-full bg-red-100 p-2 mb-2">
                <Star className="h-5 w-5 text-red-500" />
              </div>
              <div className="text-xl font-bold">{profileData.stats?.quests_completed || 0}</div>
              <div className="text-xs text-muted-foreground text-center">Quests completed</div>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.03 }}
              className="bg-background rounded-xl p-4 border flex flex-col items-center"
            >
              <div className="rounded-full bg-orange-100 p-2 mb-2">
                <Trophy className="h-5 w-5 text-orange-500" />
              </div>
              <div className="text-xl font-bold">{profileData.stats?.exp_points || 0}</div>
              <div className="text-xs text-muted-foreground text-center">Total XP</div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* User Info */}
          <motion.div 
            whileHover="hover"
            variants={cardHoverVariants}
            className="bg-background/95 backdrop-blur-lg rounded-xl border overflow-hidden"
          >
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Student info</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Department</div>
                  <div>{profileData.department || 'General Studies'}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">School</div>
                  <div>{profileData.school || 'Unknown School'}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Student since</div>
                  <div>{profileData.joined_date || 'Unknown'}</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Badges */}
          <motion.div 
            whileHover="hover"
            variants={cardHoverVariants}
            className="bg-background/95 backdrop-blur-lg rounded-xl border overflow-hidden"
          >
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Badges collected</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-5 gap-4">
                {profileData.badges_collected.map((badge: Badge) => (
                  <motion.div 
                    key={badge.id}
                    whileHover={{ scale: 1.1 }}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className={`w-12 h-12 rounded-full ${badge.color} flex items-center justify-center text-white text-2xl ${badge.locked ? "opacity-30" : ""}`}>
                      {badge.icon}
                    </div>
                    <div className="text-xs text-center text-muted-foreground">
                      {badge.locked && <span className="block text-[10px]">🔒</span>}
                      {badge.name}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Certificates */}
          <motion.div 
            whileHover="hover"
            variants={cardHoverVariants}
            className="bg-background/95 backdrop-blur-lg rounded-xl border overflow-hidden"
          >
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Certificates</h2>
            </div>
            <div className="divide-y">
              {profileData.certificates.map((cert: Certificate) => (
                <motion.div 
                  key={cert.id} 
                  className="p-4 flex items-center gap-3 hover:bg-muted/50"
                  whileHover={{ x: 5 }}
                >
                  <div className="bg-blue-100 rounded-full p-2">
                    <Award className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{cert.title}</div>
                    <div className="text-xs text-muted-foreground">{cert.date}</div>
                  </div>
                  <div className="text-lg font-semibold">{cert.score}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Right Column */}
        <motion.div variants={itemVariants} className="md:col-span-2 space-y-6">
          {/* Progress */}
          <motion.div 
            whileHover="hover"
            variants={cardHoverVariants}
            className="bg-background/95 backdrop-blur-lg rounded-xl border overflow-hidden"
          >
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Level Progress</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">{profileData.level || 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Progress to Level {profileData.level || 1 + 1}</span>
                    <span className="text-sm font-medium">{profileData.stats?.exp_points ? Math.floor(profileData.stats.exp_points / 1000) * 1000 - currentLevelExp : 0}/{nextLevelExp - currentLevelExp} XP</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <motion.div 
                      className="bg-primary h-2.5 rounded-full" 
                      initial={{ width: "0%" }}
                      animate={{ width: `${progressToNextLevel}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Current rank</span>
                  <span className="text-sm font-medium">{profileData.ranking?.position || 0} of {profileData.ranking?.total_students || 0}</span>
                </div>
                <div className="flex">
                  <div className="flex-1 h-2 bg-muted rounded-l-full">
                    <motion.div 
                      className="bg-gradient-to-r from-primary to-primary/70 h-full rounded-l-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                  <div className="flex-[2] h-2 bg-muted">
                    <motion.div 
                      className="bg-gradient-to-r from-primary/70 to-primary/30 h-full"
                      style={{ width: `${(profileData.ranking?.position || 0) / (profileData.ranking?.total_students || 1) * 100}%` }}
                    />
                  </div>
                  <div className="flex-[2] h-2 bg-muted rounded-r-full" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Activity */}
          <Tabs defaultValue="history">
            <div className="border-b bg-background/95 backdrop-blur-lg rounded-t-xl border p-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Activity</h2>
              <TabsList>
                <TabsTrigger value="history">Viewing history</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
              </TabsList>
            </div>
            
            <motion.div 
              whileHover="hover"
              variants={cardHoverVariants}
              className="bg-background/95 backdrop-blur-lg rounded-b-xl border-x border-b overflow-hidden"
            >
              <TabsContent value="history" className="p-0 m-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                  {[1, 2, 3].map((item) => (
                    <motion.div
                      key={item}
                      whileHover={{ y: -5 }}
                      className="bg-muted/40 rounded-xl overflow-hidden"
                    >
                      <div className="h-32 bg-primary/10 relative flex items-center justify-center">
                        <Video className="h-10 w-10 text-primary/50" />
                        <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs">
                          3:48 • 3 steps
                        </div>
                      </div>
                      <div className="p-3">
                        <h4 className="font-medium text-sm mb-1 truncate">Introduction to Computer Science</h4>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-xs">IN</AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">Instructor Name</span>
                          </div>
                          <span className="text-xs text-muted-foreground">01/02/23</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="achievements" className="p-0 m-0">
                <div className="p-6 space-y-4">
                  {[1, 2, 3].map((item) => (
                    <motion.div 
                      key={item}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: item * 0.1 }}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="bg-gradient-to-br from-primary/20 to-primary/10 rounded-full p-2">
                        <Trophy className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">Completed "Data Structures" course</h4>
                        <p className="text-sm text-muted-foreground">Earned 150 XP and "Quick Learner" badge</p>
                      </div>
                      <span className="text-xs text-muted-foreground">3 days ago</span>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
            </motion.div>
          </Tabs>
        </motion.div>
      </div>
    </motion.div>
  )
} 