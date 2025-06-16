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
import { Search, Loader2 } from "lucide-react";
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
    badges: 0, // This would need to be added to the backend response
    rank: user.position || index + 1,
    lastActive: "Unknown", // This would need to be added to the backend response
    questsCompleted: user.stats.quests_completed,
    streak: 0, // This would need to be added to the backend response
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
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-blue-700">Student Details</CardTitle>
            <CardDescription className="text-blue-600/80">
              Detailed information about the selected student
            </CardDescription>
          </CardHeader>          <CardContent>
            {(() => {
              const student = transformedStudents.find((s) => s.id === selectedStudent);
              if (!student) return null;

              return (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <Avatar className="h-16 w-16 ring-2 ring-offset-2 ring-offset-blue-50 ring-blue-200">
                      <AvatarImage
                        src={student.avatar || "/placeholder.svg"}
                        alt={student.name}
                      />
                      <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-bold text-blue-700">
                        {student.name}
                      </h3>
                      <div className="text-sm text-blue-600/80">
                        Rank #{student.rank} • Level {student.level}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 bg-white/50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-blue-600/80">
                        Experience Points
                      </div>
                      <div className="text-2xl font-bold text-blue-700">
                        {student.xp} XP
                      </div>
                    </div>
                    <div className="space-y-2 bg-white/50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-blue-600/80">
                        Badges Earned
                      </div>
                      <div className="text-2xl font-bold text-blue-700">
                        {student.badges}
                      </div>
                    </div>
                    <div className="space-y-2 bg-white/50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-blue-600/80">
                        Quests Completed
                      </div>
                      <div className="text-2xl font-bold text-blue-700">
                        {student.questsCompleted}
                      </div>
                    </div>
                    <div className="space-y-2 bg-white/50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-blue-600/80">
                        Current Streak
                      </div>
                      <div className="text-2xl font-bold text-blue-700">
                        {student.streak} days
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-blue-600/80">
                      Last Active
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          student.lastActive.includes("minutes")
                            ? "default"
                            : "outline"
                        }
                        className={
                          student.lastActive.includes("minutes")
                            ? "bg-blue-500 hover:bg-blue-600"
                            : "text-blue-700 border-blue-200"
                        }
                      >
                        {student.lastActive}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedStudent(null)}
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
