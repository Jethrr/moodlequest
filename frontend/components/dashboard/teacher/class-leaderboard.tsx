"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, X, Trophy, Star, Zap, Award, Target, TrendingUp, Clock } from "lucide-react";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { LeaderboardUser } from "@/types/gamification";

export function ClassLeaderboard() {
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  
  // Use the leaderboard hook to get real data
  const {
    data,
    loading,
    error,
    searchQuery,
    searchResults,
    searchLoading,
    setSearchQuery,
    refresh
  } = useLeaderboard({
    autoFetch: true,
    initialTimeframe: "all_time",
    initialMetricType: "exp"
  });

  // Combine top users and other users for complete leaderboard
  const allStudents = [...data.topUsers, ...data.otherUsers];
  
  // Use search results if there's a search query, otherwise use all students
  const displayedStudents = searchQuery.trim() ? searchResults : allStudents;

  // Transform LeaderboardUser to match the expected format
  const transformedStudents = displayedStudents.map((user, index) => ({
    id: user.id,
    name: `${user.first_name} ${user.last_name}`.trim() || user.username,
    avatar: user.profile_image_url,
    xp: user.stats.exp_points,
    level: user.level,
    badges: user.stats.badges_earned,
    rank: user.position || index + 1,
    lastActive: user.stats.last_active,
    questsCompleted: user.stats.quests_completed,
    currentRanking: user.stats.current_ranking,
  }));

  if (loading && allStudents.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h3 className="text-xl font-bold bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent">
            Class Leaderboard
          </h3>
        </div>
        <Card className="bg-gradient-to-br from-background to-muted/20 border-border/50 shadow-sm">
          <CardContent className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading leaderboard...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h3 className="text-xl font-bold bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent">
            Class Leaderboard
          </h3>
        </div>
        <Card className="bg-gradient-to-br from-background to-muted/20 border-border/50 shadow-sm">
          <CardContent className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-2">
              <p className="text-destructive">Error loading leaderboard: {error}</p>
              <Button variant="outline" onClick={refresh}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h3 className="text-xl font-bold bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent">
          Class Leaderboard
        </h3>        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search students..."
            className="pl-8 w-full sm:w-[250px] bg-muted/50 border-muted-foreground/20 focus:border-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={searchLoading}
          />
          {searchLoading && (
            <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>

      <Card className="bg-gradient-to-br from-background to-muted/20 border-border/50 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-primary/80">Student Rankings</CardTitle>
          <CardDescription>
            Based on XP earned and quest completion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transformedStudents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery.trim() ? "No students found matching your search." : "No students enrolled yet."}
              </div>
            ) : (
              transformedStudents.map((student) => (
              <div
                key={student.id}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedStudent === student.id
                    ? "bg-gradient-to-r from-primary/10 to-primary/5 shadow-sm"
                    : "hover:bg-muted/50"
                }`}
                onClick={() =>
                  setSelectedStudent(
                    student.id === selectedStudent ? null : student.id
                  )
                }
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8">
                    <span
                      className={`font-bold ${
                        student.rank === 1
                          ? "text-amber-500"
                          : student.rank === 2
                          ? "text-zinc-400"
                          : student.rank === 3
                          ? "text-amber-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {student.rank}
                    </span>
                  </div>
                  <Avatar
                    className="h-10 w-10 ring-2 ring-offset-2 ring-offset-background transition-all duration-200
                    ${student.rank === 1 
                      ? 'ring-amber-500/50' 
                      : student.rank === 2 
                        ? 'ring-zinc-400/50' 
                        : student.rank === 3 
                          ? 'ring-amber-600/50' 
                          : 'ring-primary/20'}"
                  >
                    <AvatarImage
                      src={student.avatar || "/placeholder.svg"}
                      alt={student.name}
                    />
                    <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-foreground">
                      {student.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Level {student.level}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-purple-500"
                    >
                      <path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.11" />
                      <path d="M15 7a3 3 0 1 0-6 0c0 1.66.5 3 2 5h2c1.5-2 2-3.34 2-5Z" />
                    </svg>
                    <span className="text-sm font-medium text-purple-700">
                      {student.badges}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-amber-500"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span className="text-sm font-medium text-amber-700">
                      {student.xp} XP
                    </span>
                  </div>                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-2xl bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 border-slate-700 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300">
            <CardHeader className="relative pb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-t-lg" />
              <div className="relative">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Student Details
                </CardTitle>
                <CardDescription className="text-blue-300/80 mt-1">
                  Detailed information about the selected student
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedStudent(null)}
                className="absolute top-0 right-0 h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            
            <CardContent className="space-y-8">
              {(() => {
                const student = transformedStudents.find((s) => s.id === selectedStudent);
                if (!student) return null;

                return (
                  <>
                    {/* Profile Section */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                      <div className="relative">
                        <Avatar className="h-20 w-20 ring-4 ring-blue-500/30 shadow-lg">
                          <AvatarImage
                            src={student.avatar || "/placeholder.svg"}
                            alt={student.name}
                            className="object-cover"
                          />
                          <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                            {student.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                          #{student.rank}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-2">
                          {student.name}
                        </h3>
                        <div className="flex items-center gap-4 text-blue-300">
                          <div className="flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-yellow-400" />
                            <span className="text-sm font-medium">Level {student.level}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-400" />
                            <span className="text-sm font-medium">{student.xp} XP</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 p-6 hover:from-blue-500/30 hover:to-blue-600/30 transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-transparent" />
                        <div className="relative">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-blue-500/20">
                              <Zap className="h-5 w-5 text-blue-400" />
                            </div>
                            <div className="text-sm font-medium text-blue-300">
                              Experience Points
                            </div>
                          </div>
                          <div className="text-3xl font-bold text-white">
                            {student.xp}
                          </div>
                          <div className="text-xs text-blue-400 mt-1">XP</div>
                        </div>
                      </div>

                      <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 p-6 hover:from-purple-500/30 hover:to-purple-600/30 transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-transparent" />
                        <div className="relative">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-purple-500/20">
                              <Award className="h-5 w-5 text-purple-400" />
                            </div>
                            <div className="text-sm font-medium text-purple-300">
                              Badges Earned
                            </div>
                          </div>
                          <div className="text-3xl font-bold text-white">
                            {student.badges}
                          </div>
                          <div className="text-xs text-purple-400 mt-1">Badges</div>
                        </div>
                      </div>

                      <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 p-6 hover:from-emerald-500/30 hover:to-emerald-600/30 transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-transparent" />
                        <div className="relative">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-emerald-500/20">
                              <Target className="h-5 w-5 text-emerald-400" />
                            </div>
                            <div className="text-sm font-medium text-emerald-300">
                              Quests Completed
                            </div>
                          </div>
                          <div className="text-3xl font-bold text-white">
                            {student.questsCompleted}
                          </div>
                          <div className="text-xs text-emerald-400 mt-1">Quests</div>
                        </div>
                      </div>

                      <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30 p-6 hover:from-amber-500/30 hover:to-amber-600/30 transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-transparent" />
                        <div className="relative">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-amber-500/20">
                              <TrendingUp className="h-5 w-5 text-amber-400" />
                            </div>
                            <div className="text-sm font-medium text-amber-300">
                              Current Ranking
                            </div>
                          </div>
                          <div className="text-3xl font-bold text-white">
                            #{student.currentRanking}
                          </div>
                          <div className="text-xs text-amber-400 mt-1">Position</div>
                        </div>
                      </div>
                    </div>

                    {/* Last Active Section
                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-slate-700/50">
                            <Clock className="h-5 w-5 text-slate-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-300">
                              Last Active
                            </div>
                            <div className="text-lg font-semibold text-white">
                              {student.lastActive}
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant={
                            student.lastActive.includes("minutes") || student.lastActive.includes("Just now")
                              ? "default"
                              : "secondary"
                          }
                          className={
                            student.lastActive.includes("minutes") || student.lastActive.includes("Just now")
                              ? "bg-green-500 hover:bg-green-600 text-white"
                              : "bg-slate-600 hover:bg-slate-500 text-slate-200"
                          }
                        >
                          {student.lastActive.includes("minutes") || student.lastActive.includes("Just now") ? "Online" : "Offline"}
                        </Badge>
                      </div>
                    </div> */}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setSelectedStudent(null)}
                        className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                      >
                        Close
                      </Button>
                      {/* <Button
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                      >
                        View Full Profile
                      </Button> */}
                    </div>
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
