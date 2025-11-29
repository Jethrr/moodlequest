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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Loader2,
  MoreHorizontal,
  Star,
  Trophy,
  TrendingUp,
  BookOpen,
  Award,
  Filter,
  Download,
  Mail,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { LeaderboardUser } from "@/types/gamification";

interface StudentStats {
  totalStudents: number;
  activeStudents: number;
  averageProgress: number;
  topPerformer: string;
}

export default function TeacherStudentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("rank");
  const [filterBy, setFilterBy] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] =
    useState<LeaderboardUser | null>(null);

  // Use the leaderboard hook to get real student data
  const {
    data,
    loading,
    error,
    searchQuery: hookSearchQuery,
    searchResults,
    searchLoading,
    setSearchQuery: setHookSearchQuery,
    refresh,
  } = useLeaderboard({
    autoFetch: true,
    initialTimeframe: "all_time",
    initialMetricType: "exp",
  });

  // Update hook search query when local search changes
  useEffect(() => {
    setHookSearchQuery(searchQuery);
  }, [searchQuery, setHookSearchQuery]);

  // Combine all students data
  const allStudents = [...data.topUsers, ...data.otherUsers];
  const displayedStudents = searchQuery.trim() ? searchResults : allStudents;
  // Filter students based on criteria
  const filteredStudents = displayedStudents.filter((student) => {
    // Mock last activity days since it's not in the API yet
    const mockLastActivityDays = Math.floor(Math.random() * 14);
    if (filterBy === "active") return mockLastActivityDays <= 7;
    if (filterBy === "inactive") return mockLastActivityDays > 7;
    if (filterBy === "high_performers") return (student.position || 999) <= 10;
    if (filterBy === "needs_attention")
      return student.stats.quests_completed < 3;
    return true;
  });

  // Sort students
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    switch (sortBy) {
      case "rank":
        return (a.position || 999) - (b.position || 999);
      case "name":
        return `${a.first_name} ${a.last_name}`.localeCompare(
          `${b.first_name} ${b.last_name}`
        );
      case "xp":
        return b.stats.exp_points - a.stats.exp_points;
      case "quests":
        return b.stats.quests_completed - a.stats.quests_completed;
      case "level":
        return b.level - a.level;
      default:
        return 0;
    }
  });
  // Calculate stats
  const stats: StudentStats = {
    totalStudents: allStudents.length,
    activeStudents: Math.floor(allStudents.length * 0.7), // Mock 70% active rate
    averageProgress:
      allStudents.length > 0
        ? Math.round(
            allStudents.reduce((sum, s) => sum + s.stats.exp_points, 0) /
              allStudents.length
          )
        : 0,
    topPerformer:
      allStudents.length > 0
        ? `${allStudents[0]?.first_name} ${allStudents[0]?.last_name}`.trim() ||
          allStudents[0]?.username ||
          "Unknown"
        : "No students",
  };

  if (loading && allStudents.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading students...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <p className="text-destructive">Error loading students: {error}</p>
            <Button variant="outline" onClick={refresh}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent">
          Student Management
        </h1>
        <p className="text-muted-foreground">
          Monitor student progress, engagement, and performance across all
          courses
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-blue-700 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">
              {stats.totalStudents}
            </div>
            <p className="text-sm text-blue-600/80">Enrolled in your courses</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-emerald-700 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Active Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-700">
              {stats.activeStudents} / {stats.totalStudents}
            </div>
            <p className="text-sm text-emerald-600/80">Active in last 7 days</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-purple-700 flex items-center gap-2">
              <Star className="h-5 w-5" />
              Average XP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700">
              {stats.averageProgress}
            </div>
            <p className="text-sm text-purple-600/80">
              Experience points per student
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-amber-700 flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Top Performer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-amber-700 truncate">
              {stats.topPerformer}
            </div>
            <p className="text-sm text-amber-600/80">Current leaderboard #1</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search students..."
              className="pl-8 w-full sm:w-[300px] bg-muted/50 border-muted-foreground/20 focus:border-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={searchLoading}
            />
            {searchLoading && (
              <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>

          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Students</SelectItem>
              <SelectItem value="active">Active (7 days)</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="high_performers">Top Performers</SelectItem>
              <SelectItem value="needs_attention">Needs Attention</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rank">Rank</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="xp">Experience</SelectItem>
              <SelectItem value="quests">Quests</SelectItem>
              <SelectItem value="level">Level</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Send Message
          </Button>
        </div>
      </div>

      {/* Students Table */}
      <Card className="bg-gradient-to-br from-background to-muted/20 border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle>Student Overview</CardTitle>
          <CardDescription>
            Detailed view of all students with their progress and engagement
            metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedStudents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery.trim() || filterBy !== "all"
                ? "No students found matching your criteria."
                : "No students enrolled yet."}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Rank</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Quests</TableHead>
                    <TableHead>Badges</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedStudents.map((student) => {
                    const name =
                      `${student.first_name} ${student.last_name}`.trim() ||
                      student.username;

                    return (
                      <TableRow key={student.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center justify-center w-8">
                            <span
                              className={`font-bold ${
                                (student.position || 999) === 1
                                  ? "text-amber-500"
                                  : (student.position || 999) === 2
                                  ? "text-zinc-400"
                                  : (student.position || 999) === 3
                                  ? "text-amber-600"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {student.position || "—"}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={
                                  student.profile_image_url ||
                                  "/placeholder.svg"
                                }
                                alt={name}
                              />
                              <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{name}</div>
                              <div className="text-sm text-muted-foreground">
                                {student.username}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge variant="secondary" className="font-medium">
                            Level {student.level}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-amber-500" />
                            <span className="font-medium">
                              {student.stats.exp_points} XP
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Award className="h-4 w-4 text-purple-500" />
                            <span className="font-medium">
                              {student.stats.quests_completed}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Award className="h-4 w-4 text-purple-500" />
                            <span className="font-medium">
                              {student.stats.badges_earned}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => setSelectedStudent(student)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="h-4 w-4 mr-2" />
                                Send Message
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Export Progress
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <Card className="fixed inset-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Student Details</h3>
              <Button
                variant="ghost"
                onClick={() => setSelectedStudent(null)}
                className="h-8 w-8 p-0"
              >
                ×
              </Button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={
                      selectedStudent.profile_image_url || "/placeholder.svg"
                    }
                    alt={`${selectedStudent.first_name} ${selectedStudent.last_name}`}
                  />
                  <AvatarFallback>
                    {`${selectedStudent.first_name} ${selectedStudent.last_name}`.charAt(
                      0
                    )}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="text-xl font-bold">
                    {`${selectedStudent.first_name} ${selectedStudent.last_name}`.trim() ||
                      selectedStudent.username}
                  </h4>
                  <p className="text-muted-foreground">
                    @{selectedStudent.username}
                  </p>
                  <Badge variant="secondary">
                    Level {selectedStudent.level}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Experience Points
                  </div>
                  <div className="text-2xl font-bold">
                    {selectedStudent.stats.exp_points} XP
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Rank
                  </div>
                  <div className="text-2xl font-bold">
                    #{selectedStudent.position || "—"}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Quests Completed
                  </div>
                  <div className="text-2xl font-bold">
                    {selectedStudent.stats.quests_completed}
                  </div>
                </div>{" "}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Last Active
                  </div>
                  <div className="text-2xl font-bold">
                    {Math.floor(Math.random() * 14) <= 1
                      ? "Today"
                      : `${Math.floor(Math.random() * 14)}d ago`}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Export Progress
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
