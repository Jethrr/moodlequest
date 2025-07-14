"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, TrendingUp, Award, Target, Users, Clock, Activity, BarChart3, Calendar, Zap, Target as TargetIcon, Users as UsersIcon, Clock as ClockIcon, Activity as ActivityIcon } from "lucide-react";
import { useState } from "react";
import { useAnalytics } from "@/hooks/use-analytics";



const COLORS = {
  purple: ["#8b5cf6", "#7c3aed", "#6d28d9", "#5b21b6"],
  emerald: ["#10b981", "#059669", "#047857", "#065f46"],
  blue: ["#3b82f6", "#2563eb", "#1d4ed8", "#1e40af"],
};

export function StudentProgressAnalytics() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "semester">(
    "week"
  );
  const [selectedSubject, setSelectedSubject] = useState("all");

  // Use real analytics data
  const {
    engagementData,
    performanceData,
    engagementInsights,
    summary,
    loading,
    error,
    setTimeRange: setAnalyticsTimeRange,
  } = useAnalytics({
    timeRange,
    autoFetch: true,
  });

  // Calculate summary stats
  const totalAverageXp = performanceData.length > 0 
    ? performanceData.reduce((sum, item) => sum + item.averageXp, 0) / performanceData.length 
    : 0;
  
  const totalCompletionRate = performanceData.length > 0 
    ? performanceData.reduce((sum, item) => sum + item.completionRate, 0) / performanceData.length 
    : 0;

  // Calculate date range for display
  const getDateRangeText = () => {
    const endDate = new Date();
    const startDate = new Date();
    
    if (timeRange === "week") {
      startDate.setDate(endDate.getDate() - 7);
    } else if (timeRange === "month") {
      startDate.setDate(endDate.getDate() - 30);
    } else if (timeRange === "semester") {
      startDate.setDate(endDate.getDate() - 90);
    }
    
    return {
      start: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      end: endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
  };

  const dateRange = getDateRangeText();

  return (
    <div className="space-y-6">
      {/* Header with improved styling */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent">
            Student Progress Analytics
          </h3>
          <p className="text-muted-foreground mt-1">
            Track engagement, performance, and individual progress
          </p>
          <p className="text-sm text-muted-foreground/80 mt-1">
            Showing data from {dateRange.start} to {dateRange.end}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select
            value={timeRange}
            onValueChange={(value) => {
              const newTimeRange = value as "week" | "month" | "semester";
              setTimeRange(newTimeRange);
              setAnalyticsTimeRange(newTimeRange);
            }}
          >
            <SelectTrigger className="w-[150px] bg-muted/50 border-muted-foreground/20">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="semester">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-[150px] bg-muted/50 border-muted-foreground/20">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              <SelectItem value="math">Math</SelectItem>
              <SelectItem value="science">Science</SelectItem>
              <SelectItem value="english">English</SelectItem>
              <SelectItem value="history">History</SelectItem>
              <SelectItem value="cs">Computer Science</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-100">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Users className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-emerald-600">Active Users</p>
                  <p className="text-2xl font-bold text-emerald-700">{summary.totalActiveUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-600">Avg Daily XP</p>
                  <p className="text-2xl font-bold text-purple-700">{Math.round(totalAverageXp)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Award className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600">Avg Daily Completion</p>
                  <p className="text-2xl font-bold text-blue-700">{Math.round(totalCompletionRate)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="engagement" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50">
          <TabsTrigger
            value="engagement"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Engagement
          </TabsTrigger>
          <TabsTrigger
            value="performance"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Target className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger
            value="insights"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Activity className="h-4 w-4 mr-2" />
            Engagement Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="engagement" className="mt-6">
          <Card className="bg-white border border-emerald-100 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                Class Engagement
              </CardTitle>
              <CardDescription className="text-black">
                Daily active users and quest activity over time
              </CardDescription>
            </CardHeader>
            <CardContent className="w-full">
              {loading && (
                <div className="flex items-center justify-center h-[400px]">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading engagement data...
                  </div>
                </div>
              )}
              {error && (
                <div className="flex items-center justify-center h-[400px]">
                  <div className="text-red-700 bg-red-100 p-4 rounded-lg">
                    Error: {error}
                  </div>
                </div>
              )}
              {!loading && !error && engagementData.length > 0 && (
                <ChartContainer
                  config={{
                    activeUsers: {
                      label: "Active Users",
                      color: "#059669", // emerald-600
                    },
                    badgesEarned: {
                      label: "Badges Earned",
                      color: "#10b981", // emerald-500
                    },
                    questsCompleted: {
                      label: "Quests Completed",
                      color: "#047857", // emerald-700
                    },
                  }}
                  className="h-[400px] w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={engagementData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-emerald-200"
                      />
                      <XAxis dataKey="day" className="text-black" tick={{ fill: '#111' }} />
                      <YAxis className="text-black" tick={{ fill: '#111' }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend wrapperStyle={{ color: '#111' }} />
                      <Line
                        type="monotone"
                        dataKey="activeUsers"
                        stroke="#059669"
                        name="Active Users"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="badgesEarned"
                        stroke="#10b981"
                        name="Badges Earned"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="questsCompleted"
                        stroke="#047857"
                        name="Quests Completed"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
              {!loading && !error && engagementData.length === 0 && (
                <div className="flex items-center justify-center h-[400px]">
                  <div className="text-muted-foreground text-center">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No engagement data available for the selected time range.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <Card className="bg-white border border-purple-100 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black">
                <Target className="h-5 w-5 text-purple-600" />
                Performance Analytics
              </CardTitle>
              <CardDescription className="text-black">
                Daily average XP and completion rates for the selected time period
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading && (
                <div className="flex items-center justify-center h-[400px]">
                  <div className="flex items-center gap-2 text-purple-700">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading performance data...
                  </div>
                </div>
              )}
              {error && (
                <div className="flex items-center justify-center h-[400px]">
                  <div className="text-red-700 bg-red-100 p-4 rounded-lg">
                    Error: {error}
                  </div>
                </div>
              )}
              {!loading && !error && performanceData.length > 0 && (
                <>
                  <ChartContainer
                    config={{
                      averageXp: {
                        label: "Average XP",
                        color: "#7c3aed", // purple-600
                      },
                      completionRate: {
                        label: "Completion Rate",
                        color: "#a21caf", // purple-800
                      },
                    }}
                    className="h-[400px] w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={performanceData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="stroke-purple-200"
                        />
                        <XAxis dataKey="day" className="text-black" tick={{ fill: '#111' }} />
                        <YAxis className="text-black" tick={{ fill: '#111' }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend wrapperStyle={{ color: '#111' }} />
                        <Bar
                          dataKey="averageXp"
                          fill="#7c3aed"
                          name="Average XP"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="completionRate"
                          fill="#a21caf"
                          name="Completion Rate (%)"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                  {/* Performance Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                    {/* Data Summary Card */}
                    <Card className="bg-purple-50 border border-purple-200 col-span-full">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold text-black">Data Summary</h4>
                            <p className="text-sm text-black">
                              {performanceData.length} days of data • {performanceData.reduce((sum, item) => sum + item.totalAttempts, 0)} total attempts
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
              {!loading && !error && performanceData.length === 0 && (
                <div className="flex items-center justify-center h-[400px]">
                  <div className="text-muted-foreground text-center">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No performance data available for the selected time range.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="mt-6">
          <div className="space-y-6">
            {/* Engagement Insights Overview */}
            <Card className="bg-white border border-blue-100 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Engagement Insights
                </CardTitle>
                <CardDescription className="text-black">
                  Deep dive into user behavior patterns and engagement metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading && (
                  <div className="flex items-center justify-center h-[400px]">
                    <div className="flex items-center gap-2 text-blue-700">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Loading engagement insights...
                    </div>
                  </div>
                )}
                {error && (
                  <div className="flex items-center justify-center h-[400px]">
                    <div className="text-red-700 bg-red-100 p-4 rounded-lg">
                      Error: {error}
                    </div>
                  </div>
                )}
                {!loading && !error && engagementInsights && (
                  <div className="space-y-6">
                    {/* Login Patterns & Engagement Levels */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card className="bg-blue-50 border border-blue-200 shadow-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-black text-sm">
                            <Clock className="h-4 w-4 text-blue-600" />
                            Login Patterns
                          </CardTitle>
                          <CardDescription className="text-black text-xs">
                            User activity by hour of day
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ChartContainer
                            config={{
                              uniqueUsers: {
                                label: "Active Users",
                                color: "#2563eb", // blue-600
                              },
                            }}
                            className="h-[200px] w-full"
                          >
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={engagementInsights.loginPatterns}>
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  className="stroke-blue-200"
                                />
                                <XAxis 
                                  dataKey="hour" 
                                  className="text-black text-xs"
                                  tick={{ fill: '#111' }}
                                  tickFormatter={(value) => `${value}:00`}
                                />
                                <YAxis className="text-black text-xs" tick={{ fill: '#111' }} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar
                                  dataKey="uniqueUsers"
                                  fill="#2563eb"
                                  radius={[2, 2, 0, 0]}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </CardContent>
                      </Card>

                      {/* Engagement Levels */}
                      <Card className="bg-blue-50 border border-blue-200 shadow-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-black text-sm">
                            <Users className="h-4 w-4 text-blue-600" />
                            Engagement Levels
                          </CardTitle>
                          <CardDescription className="text-black text-xs">
                            Users categorized by activity intensity
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                                <span className="text-sm font-medium text-black">High Engagement</span>
                              </div>
                              <span className="text-sm font-bold text-emerald-700">
                                {engagementInsights.engagementLevels.high}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                                <span className="text-sm font-medium text-black">Medium Engagement</span>
                              </div>
                              <span className="text-sm font-bold text-yellow-600">
                                {engagementInsights.engagementLevels.medium}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <span className="text-sm font-medium text-black">Low Engagement</span>
                              </div>
                              <span className="text-sm font-bold text-red-600">
                                {engagementInsights.engagementLevels.low}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Streak Analysis */}
                    <Card className="bg-blue-50 border border-blue-200 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-black text-sm">
                          <Zap className="h-4 w-4 text-purple-600" />
                          Streak Analysis
                        </CardTitle>
                        <CardDescription className="text-black text-xs">
                          Consistency and engagement patterns
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-black">
                              {engagementInsights.streakAnalysis.currentStreak}
                            </div>
                            <div className="text-xs text-black">Current Streak</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-black">
                              {engagementInsights.streakAnalysis.maxStreak}
                            </div>
                            <div className="text-xs text-black">Max Streak</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-black">
                              {engagementInsights.streakAnalysis.activeDays}
                            </div>
                            <div className="text-xs text-black">Active Days</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-black">
                              {engagementInsights.streakAnalysis.consistencyRate.toFixed(1)}%
                            </div>
                            <div className="text-xs text-black">Consistency</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Most Active Time Periods */}
                    <Card className="bg-blue-50 border border-blue-200 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-black text-sm">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          Most Active Time Periods
                        </CardTitle>
                        <CardDescription className="text-black text-xs">
                          When users are most engaged
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer
                          config={{
                            activityCount: {
                              label: "Activity Count",
                              color: "#2563eb", // blue-600
                            },
                          }}
                          className="h-[200px] w-full"
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={engagementInsights.timePeriods}>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                className="stroke-blue-200"
                              />
                              <XAxis 
                                dataKey="period" 
                                className="text-black text-xs"
                                tick={{ fill: '#111' }}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                              />
                              <YAxis className="text-black text-xs" tick={{ fill: '#111' }} />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Bar
                                dataKey="activityCount"
                                fill="#2563eb"
                                radius={[2, 2, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </CardContent>
                    </Card>

                    {/* Action Distribution */}
                    <Card className="bg-blue-50 border border-blue-200 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-black text-sm">
                          <BarChart3 className="h-4 w-4 text-blue-600" />
                          Action Distribution
                        </CardTitle>
                        <CardDescription className="text-black text-xs">
                          Most common user activities
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {engagementInsights.actionDistribution.slice(0, 5).map((action, index) => (
                            <div key={action.action} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full"
                                  style={{
                                    backgroundColor: [
                                      '#2563eb', // blue-600
                                      '#10b981', // emerald-500
                                      '#a21caf', // purple-800
                                      '#f59e42', // orange-400
                                      '#ef4444', // red-500
                                    ][index % 5]
                                  }}
                                ></div>
                                <span className="text-sm font-medium text-black capitalize">
                                  {action.action.replace('_', ' ')}
                                </span>
                              </div>
                              <span className="text-sm font-bold text-black">
                                {action.count}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
                {!loading && !error && !engagementInsights && (
                  <div className="flex items-center justify-center h-[400px]">
                    <div className="text-muted-foreground text-center">
                      <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No engagement insights available for the selected time range.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>


      </Tabs>
    </div>
  );
}
