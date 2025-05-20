"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Tooltip } from "recharts"
import { motion } from "framer-motion"
import StreakGraph from "./streak-graph"

// Mock data for progress tracking based on backend schema
const weeklyData = [
  { day: "Mon", exp_reward: 50, quests_completed: 2 },
  { day: "Tue", exp_reward: 80, quests_completed: 3 },
  { day: "Wed", exp_reward: 40, quests_completed: 1 },
  { day: "Thu", exp_reward: 120, quests_completed: 4 },
  { day: "Fri", exp_reward: 60, quests_completed: 2 },
  { day: "Sat", exp_reward: 30, quests_completed: 1 },
  { day: "Sun", exp_reward: 90, quests_completed: 3 },
]

const monthlyData = [
  { week: "Week 1", exp_reward: 350, quests_completed: 12 },
  { week: "Week 2", exp_reward: 420, quests_completed: 15 },
  { week: "Week 3", exp_reward: 280, quests_completed: 10 },
  { week: "Week 4", exp_reward: 390, quests_completed: 14 },
]

// Mock data for streak tracking (last 105 days - 15 weeks)
interface StreakDay {
  date: string;
  intensity: number;
  dayOfWeek: number;
}

const generateStreakData = (): StreakDay[] => {
  const today = new Date();
  const data: StreakDay[] = [];
  
  // Generate data for last 105 days (15 weeks)
  for (let i = 104; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    // Random activity intensity (0-4)
    // 0: no activity, 1-4: activity intensity levels
    let intensity = 0;
    
    // Create patterns - more activity on weekdays, less on weekends
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Generate activity patterns
    const random = Math.random();
    
    if (isWeekend) {
      // Less activity on weekends
      if (random < 0.7) intensity = 0;
      else if (random < 0.85) intensity = 1;
      else if (random < 0.95) intensity = 2;
      else intensity = 3;
    } else {
      // More activity on weekdays
      if (random < 0.25) intensity = 0;
      else if (random < 0.5) intensity = 1;
      else if (random < 0.75) intensity = 2;
      else if (random < 0.9) intensity = 3;
      else intensity = 4;
    }
    
    // Create streak patterns (consecutive days with activity)
    // If previous 2-3 days had activity, increase chance of activity
    if (data.length >= 2 && 
        data[data.length-1].intensity > 0 && 
        data[data.length-2].intensity > 0) {
      if (intensity === 0 && Math.random() < 0.7) {
        intensity = Math.floor(Math.random() * 3) + 1;
      }
    }
    
    data.push({
      date: date.toISOString().split('T')[0],
      intensity,
      dayOfWeek
    });
  }
  
  return data;
};

const streakData = generateStreakData();

// Calculate current streak
const calculateCurrentStreak = (data: StreakDay[]): number => {
  let currentStreak = 0;
  
  // Start from the most recent day
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i].intensity > 0) {
      currentStreak++;
    } else {
      break;
    }
  }
  
  return currentStreak;
};

// Calculate longest streak
const calculateLongestStreak = (data: StreakDay[]): number => {
  let longestStreak = 0;
  let currentStreak = 0;
  
  for (let i = 0; i < data.length; i++) {
    if (data[i].intensity > 0) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }
  
  return longestStreak;
};

const courseProgress = [
  { course_title: "Mathematics", progress: 75, total_quests: 20, completed_quests: 15 },
  { course_title: "Science", progress: 60, total_quests: 18, completed_quests: 11 },
  { course_title: "English Literature", progress: 90, total_quests: 15, completed_quests: 13 },
  { course_title: "History", progress: 40, total_quests: 12, completed_quests: 5 },
  { course_title: "Computer Science", progress: 85, total_quests: 10, completed_quests: 8 },
]

export function ProgressTracker() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-6 rounded-xl bg-card dark:bg-transparent"
    >
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-primary">Progress Tracker</h2>
        <p className="text-muted-foreground">Monitor your learning journey and track your achievements over time.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-primary">Total XP</CardTitle>
              <CardDescription>Experience points earned</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">1,450 XP</div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-primary">Quests Completed</CardTitle>
              <CardDescription>Total learning missions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">52 / 78</div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-primary">Current Level</CardTitle>
              <CardDescription>Your learning rank</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">Level 5</div>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Progress to Level 6</span>
                  <span>450/600 XP</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="weekly">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-primary">Activity Overview</h3>
          <TabsList>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="weekly" className="mt-4">
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardContent className="pt-6">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="day" stroke="var(--foreground)" />
                      <YAxis stroke="var(--foreground)" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "var(--card)",
                          borderColor: "var(--border)",
                          borderRadius: "8px",
                          color: "var(--foreground)"
                        }} 
                        labelStyle={{ color: "var(--foreground)" }}
                      />
                      <Legend wrapperStyle={{ color: "var(--foreground)" }} />
                      <Line 
                        type="monotone" 
                        dataKey="exp_reward" 
                        name="XP Earned" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        activeDot={{ r: 6 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="quests_completed" 
                        name="Quests Completed" 
                        stroke="hsl(var(--chart-2))" 
                        strokeWidth={2}
                        activeDot={{ r: 6 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
        <TabsContent value="monthly" className="mt-4">
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardContent className="pt-6">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="week" stroke="var(--foreground)" />
                      <YAxis stroke="var(--foreground)" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "var(--card)",
                          borderColor: "var(--border)",
                          borderRadius: "8px",
                          color: "var(--foreground)"
                        }} 
                        labelStyle={{ color: "var(--foreground)" }}
                      />
                      <Legend wrapperStyle={{ color: "var(--foreground)" }} />
                      <Line 
                        type="monotone" 
                        dataKey="exp_reward" 
                        name="XP Earned" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        activeDot={{ r: 6 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="quests_completed" 
                        name="Quests Completed" 
                        stroke="hsl(var(--chart-2))" 
                        strokeWidth={2}
                        activeDot={{ r: 6 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
      <div>
        <h3 className="text-xl font-bold mb-4 text-primary">Course Progress</h3>
        <div className="space-y-6">
          {courseProgress.map((course) => (
            <motion.div 
              key={course.course_title} 
              className="space-y-2 p-3 rounded-lg bg-background border shadow-sm"
              whileHover={{ scale: 1.01, x: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="flex justify-between">
                <div className="font-medium text-primary">{course.course_title}</div>
                <div className="text-sm text-primary">{course.completed_quests} / {course.total_quests} quests completed
                </div>
              </div>
              <Progress value={course.progress} className="h-2" />
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4 text-primary">Learning Streaks</h3>
        <div className="mb-2 text-muted-foreground">
          Track your daily learning activities and maintain your streak for consistent progress.
        </div>
        <StreakGraph data={streakData} />
      </div>
    </motion.div>
  )
}
