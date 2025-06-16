"use client";

import type React from "react";
import { useCurrentUser } from "@/hooks/useCurrentMoodleUser";
import { createQuest, QuestCreationResponse } from "@/lib/quest-service";
import { useToast } from "@/hooks/use-toast";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Quests, Task, Reward } from "@/types/gamification";
import { Plus, Trash2, Save, Sparkles, Filter, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface MoodleDate {
  label: string;
  timestamp: number;
  dataid: string;
}

interface MoodleActivity {
  id: number;
  name: string;
  type: string;
  modname: string; // Moodle module name (assign, quiz, etc.)
  course: number; // course ID from Moodle
  description?: string;
  instance: number;
  is_assigned?: boolean;
  dates?: MoodleDate[]; // Activity dates (due dates, open/close dates, etc.)
  raw?: any; // Raw Moodle data
}

interface Course {
  id: number;
  fullname: string;
  shortname: string;
  categoryid: number;
  raw?: any;
}

const stripHtmlTags = (html: string) => {
  if (typeof document !== "undefined") {
    const temp = document.createElement("div");
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || "";
  }
  return html.replace(/<[^>]*>?/gm, "");
};

export function QuestCreator() {
  const [activities, setActivities] = useState<MoodleActivity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<
    MoodleActivity[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] =
    useState<MoodleActivity | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterAssigned, setFilterAssigned] = useState<string>("unassigned");
  const [searchQuery, setSearchQuery] = useState("");
  const [courseMap, setCourseMap] = useState<{ [id: number]: string }>({});
  const { user } = useCurrentUser();
  const [quest, setQuest] = useState<Partial<Quest>>({
    xp: 50,
    difficulty: "Medium",
    learningObjectives: [],
    tasks: [],
    rewards: [],
  });

  const [newObjective, setNewObjective] = useState("");
  const [newTask, setNewTask] = useState<Partial<Task>>({
    description: "view_lesson", // Initialize with the first task type
    xpReward: 10,
  });
  const [newReward, setNewReward] = useState<Partial<Reward>>({
    type: "xp",
    value: 0,
    name: "",
  });

  const { toast } = useToast();

  // Task types for dropdown
  const TASK_TYPES = [
    "New Beginnings – Create an account",
    "Tested and Tried – Submit a quiz",
    "Taking the Challenge – Attempt a quiz",
    "Mission Accomplished – Submit an assignment",
    "Scoreboard Update – Receive a grade",
    "Checkpoint Cleared – Complete an activity",
    "Champion Status – Complete a course",
    "Speak Up – Create a forum post",
    "Gather the Troops – Create a discussion",
    "Lesson Mastered – Complete a lesson",
    "Curious Mind – View a lesson",
    "Your Voice Matters – Submit feedback",
    "Decision Time – Submit a choice",
    "Explorer Mode – View a resource",
    "Bookworm Bonus – View a book",
    "Page Turner – View a page",
    "Link Seeker – View a URL",
    "Wordsmith – Create a glossary entry",
    "Wiki Wizard – Create a wiki page",
    "Wiki Refresher – Update a wiki page",
    "Chatterbox – Send a chat message",
  ];

  // Fetch Moodle activities and courses
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch activities
        // Change the URL to your actual Backend API endpoint i didnt put env here sa diri
        const activitiesRes = await fetch(
          "http://localhost:8002/api/auth/get-activities",
          {
            credentials: "include",
          }
        );
        const activitiesData = await activitiesRes.json();
        // Fetch courses
        const coursesRes = await fetch(
          "http://localhost:8002/api/auth/get-course",
          {
            credentials: "include",
          }
        );
        const coursesData = await coursesRes.json();

        // Create course mapping
        const courseMapping: { [id: number]: string } = {};
        coursesData.courses?.forEach((course: Course) => {
          courseMapping[course.id] = course.fullname;
        });
        setCourseMap(courseMapping); // Log the received data for debugging
        console.log("Activities data received:", activitiesData);

        // Function to normalize activity types from Moodle's internal names
        const normalizeActivityType = (type: string) => {
          switch (type) {
            case "assign":
              return "assignment";
            case "quiz":
              return "quiz";
            case "lesson":
              return "lesson";
            case "forum":
              return "forum";
            default:
              return "other";
          }
        };

        // Function to extract description from various sources
        const extractDescription = (activity: any) => {
          return stripHtmlTags(
            activity.description ||
              activity.raw?.description ||
              activity.raw?.intro ||
              ""
          );
        };

        // Process each type of activity
        const assignmentActivities = (activitiesData.assignments || []).map(
          (a: any) => ({
            ...a,
            type: normalizeActivityType(a.modname || a.type),
            description: extractDescription(a),
            is_assigned: a.is_assigned ?? false,
            dates: a.raw?.dates || [],
          })
        );

        const quizActivities = (activitiesData.quizzes || []).map((q: any) => ({
          ...q,
          type: normalizeActivityType(q.modname || q.type),
          description: extractDescription(q),
          is_assigned: q.is_assigned ?? false,
          dates: q.raw?.dates || [],
        }));

        const lessonActivities = (activitiesData.lessons || []).map(
          (l: any) => ({
            ...l,
            type: normalizeActivityType(l.modname || l.type),
            description: extractDescription(l),
            is_assigned: l.is_assigned ?? false,
            dates: l.raw?.dates || [],
          })
        );

        const forumActivities = (activitiesData.forums || []).map((f: any) => ({
          ...f,
          type: normalizeActivityType(f.modname || f.type),
          description: extractDescription(f),
          is_assigned: f.is_assigned ?? false,
          dates: f.raw?.dates || [],
        }));

        const otherActivities = (activitiesData.others || []).map((o: any) => ({
          ...o,
          type: normalizeActivityType(o.modname || o.type),
          description: extractDescription(o),
          is_assigned: o.is_assigned ?? false,
          dates: o.raw?.dates || [],
        })); // Combine all activities
        const allActivities = [
          ...assignmentActivities,
          ...quizActivities,
          ...lessonActivities,
          ...forumActivities,
          ...otherActivities,
        ];

        // Log the processed activities for debugging
        // console.log("Processed activities:", {
        //   total: allActivities.length,
        //   byType: allActivities.reduce((acc, curr) => {
        //     acc[curr.type] = (acc[curr.type] || 0) + 1;
        //     return acc;
        //   }, {} as Record<string, number>),
        // });

        // Log the processed activities for debugging
        // console.log("Processed activities:", {
        //   total: allActivities.length,
        //   byType: allActivities.reduce((acc, curr) => {
        //     acc[curr.type] = (acc[curr.type] || 0) + 1;
        //     return acc;
        //   }, {} as Record<string, number>),
        // });

        setActivities(allActivities);
        setFilteredActivities(allActivities);
      } catch (error) {
        console.error("Error fetching data:", error);
        // You might want to show an error message to the user here
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  // Apply filters when they change
  useEffect(() => {
    // Log current filter state

    let result = [...activities];

    // Log unique activity types in current dataset
    const uniqueTypes = [...new Set(activities.map((a) => a.type))];

    // Filter by activity type
    if (filterType !== "all") {
      result = result.filter((activity) => activity.type === filterType);
    }

    // Filter by assignment status
    if (filterAssigned === "assigned") {
      result = result.filter((activity) => activity.is_assigned);
    } else if (filterAssigned === "unassigned") {
      result = result.filter((activity) => !activity.is_assigned);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (activity) =>
          activity.name.toLowerCase().includes(query) ||
          activity.description?.toLowerCase().includes(query) ||
          activity.course.toString().toLowerCase().includes(query)
      );
    }

    // console.log("Final filtered activities:", {
    //   count: result.length,
    //   types: [...new Set(result.map((a) => a.type))],
    // });

    setFilteredActivities(result);
  }, [filterType, filterAssigned, searchQuery, activities]);

  // Handle activity selection
  const handleSelectActivity = (activity: MoodleActivity) => {
    setSelectedActivity(activity);
    // console.log("Selected activity:", activity.id);
    // Pre-populate the quest form with activity data
    setQuest({
      title: activity.name,
      description: activity.description,
      xp: 50,
      difficulty: "Medium",
      category: activity.course.toString(),
      learningObjectives: [],
      tasks: [],
      rewards: [],
    });
  };

  const addLearningObjective = () => {
    if (newObjective.trim()) {
      setQuest({
        ...quest,
        learningObjectives: [...(quest.learningObjectives || []), newObjective],
      });
      setNewObjective("");
    }
  };

  const removeLearningObjective = (index: number) => {
    const updatedObjectives = [...(quest.learningObjectives || [])];
    updatedObjectives.splice(index, 1);
    setQuest({
      ...quest,
      learningObjectives: updatedObjectives,
    });
  };
  const addTask = () => {
    // Make sure there is a valid task type selected
    if (newTask.description) {
      // console.log("Task description exists, adding to quest");
      const updatedTasks = [
        ...(quest.tasks || []),
        {
          id: `task-${Date.now()}`,
          description: newTask.description, // Task type from dropdown
          completed: false,
          xpReward: newTask.xpReward || 10,
        } as Task,
      ];

      // Update quest with new task
      setQuest({
        ...quest,
        tasks: updatedTasks,
      });

      // Reset newTask for the next input
      setNewTask({
        description: TASK_TYPES[0],
        xpReward: 10,
      });
    } else {
      console.warn("No task description provided");
    }
  };

  const removeTask = (index: number) => {
    const updatedTasks = [...(quest.tasks || [])];
    updatedTasks.splice(index, 1);
    setQuest({
      ...quest,
      tasks: updatedTasks,
    });
  };

  const addReward = () => {
    if (newReward.name?.trim() && newReward.value) {
      setQuest({
        ...quest,
        rewards: [
          ...(quest.rewards || []),
          {
            type: newReward.type,
            value: newReward.value,
            name: newReward.name,
            description: newReward.description,
          } as Reward,
        ],
      });
      setNewReward({ type: "xp", value: 0, name: "" });
    }
  };

  const removeReward = (index: number) => {
    const updatedRewards = [...(quest.rewards || [])];
    updatedRewards.splice(index, 1);
    setQuest({
      ...quest,
      rewards: updatedRewards,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedActivity) {
      toast({
        title: "No Activity Selected",
        description: "Please select a Moodle activity first.",
        variant: "destructive",
      });
      return;
    }

    // Calculate total XP from tasks
    const taskXP = (quest.tasks || []).reduce(
      (sum, task) => sum + (task.xpReward || 0),
      0
    );
    const rewardXP = (quest.rewards || [])
      .filter((reward) => reward.type === "xp")
      .reduce((sum, reward) => sum + (reward.value || 0), 0);
    const totalXP = taskXP + rewardXP;

    // Map difficulty string to integer for backend
    const difficultyMap: Record<string, number> = {
      Easy: 1,
      Medium: 2,
      Hard: 3,
      Epic: 4,
    };
    const difficultyInt = difficultyMap[quest.difficulty as string] || 2;

    const completeQuest: Quest = {
      id: `quest-${Date.now()}`,
      title: quest.title || selectedActivity.name,
      description: quest.description || selectedActivity.description || "",
      xp: totalXP,
      progress: 0,
      moodleActivityId: selectedActivity.id,
      moodleCourse: selectedActivity.course,
      difficulty: quest.difficulty as "Easy" | "Medium" | "Hard" | "Epic",
      category: selectedActivity.type.toString(),
      deadline: selectedActivity.dates?.find((d) =>
        d.label.toLowerCase().includes("due")
      )?.timestamp
        ? new Date(
            selectedActivity.dates.find((d) =>
              d.label.toLowerCase().includes("due")
            )!.timestamp * 1000
          ).toISOString()
        : null,
      status: "not-started",
      creatorId: user?.id ?? 0,
      learningObjectives: quest.learningObjectives || [],
      tasks: (quest.tasks as Task[]) || [],
      rewards: (quest.rewards as Reward[]) || [],
    };
    console.log("Submitting quest:", completeQuest);
    try {
      // Send to backend with correct difficulty type and field mapping
      const response: QuestCreationResponse = await createQuest({
        ...completeQuest,
        difficulty: difficultyInt,
        course_id: selectedActivity.course, // Map moodleCourse to course_id for backend
        moodle_course_id: selectedActivity.course,
        moodle_user_id: user?.id ?? 0,
        moodle_activity_id: selectedActivity.id, // Map moodleActivityId to moodle_activity_id
      });

      if (!response || response.success === false) {
        toast({
          title: "Failed to create quest",
          description:
            response?.error ||
            response?.message ||
            "Unknown error. See console.",
          variant: "destructive",
        });
        console.error("Quest creation error:", response);
        return;
      }

      // Success!
      toast({
        title: "Quest Assigned!",
        description:
          "Gamification elements successfully assigned to Moodle activity.",
      });

      // Mark activity as assigned in the mock data
      const updatedActivities = activities.map((activity) =>
        activity.id === selectedActivity.id
          ? { ...activity, is_assigned: true }
          : activity
      );
      setActivities(updatedActivities);
      setFilteredActivities(
        updatedActivities.filter(
          (a) =>
            !a.is_assigned && (filterType === "all" || a.type === filterType)
        )
      );
      setSelectedActivity(null);
      setQuest({
        xp: 50,
        difficulty: "Medium",
        learningObjectives: [],
        tasks: [],
        rewards: [],
      });
    } catch (error: any) {
      toast({
        title: "Failed to assign quest",
        description:
          error?.error || error?.message || "Unknown error. See console.",
        variant: "destructive",
      });
      console.error("Quest creation error:", error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Moodle Activities</CardTitle>
          <CardDescription>
            Please wait while we fetch available activities from Moodle...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Assign Gamification to Moodle Activities</CardTitle>
          <CardDescription>
            Select an existing Moodle activity and turn it into a quest by
            adding XP, badges, and learning objectives
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="search">Search Activities</Label>
                <Input
                  id="search"
                  placeholder="Search by name, description or course"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="space-y-1">
                <Label>Activity Type</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>{" "}
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="assignment">Assignments</SelectItem>
                    <SelectItem value="quiz">Quizzes</SelectItem>
                    <SelectItem value="lesson">Lessons</SelectItem>
                    <SelectItem value="forum">Forums</SelectItem>
                    <SelectItem value="other">Other Activities</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Label>Show:</Label>
              <RadioGroup
                defaultValue="unassigned"
                value={filterAssigned}
                onValueChange={setFilterAssigned}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unassigned" id="unassigned" />
                  <Label htmlFor="unassigned">Unassigned Activities</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="assigned" id="assigned" />
                  <Label htmlFor="assigned">Already Assigned</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all">All Activities</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Activity list */}
            <div className="border rounded-md">
              {filteredActivities.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-muted-foreground">
                    No matching Moodle activities found
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try changing your search or filters
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className={`p-4 hover:bg-muted/50 cursor-pointer ${
                        selectedActivity?.id === activity.id
                          ? "bg-primary/10"
                          : ""
                      }`}
                      onClick={() => handleSelectActivity(activity)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{activity.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {activity.description}
                          </p>
                          <div className="flex items-center mt-2 gap-2">
                            <Badge variant="outline">{activity.type}</Badge>{" "}
                            <span className="text-xs text-muted-foreground">
                              {courseMap[activity.course] ||
                                `Course ${activity.course}`}
                            </span>{" "}
                            {activity.dates?.map((date, index) => (
                              <span
                                key={index}
                                className="text-xs text-muted-foreground"
                              >
                                {date.label}{" "}
                                {new Date(
                                  date.timestamp * 1000
                                ).toLocaleDateString()}
                              </span>
                            ))}
                          </div>
                        </div>
                        {activity.is_assigned && (
                          <Badge className="ml-2 bg-green-500">Assigned</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedActivity && (
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Gamify: {selectedActivity.name}</CardTitle>
                  <CardDescription>
                    Add gamification elements to this Moodle activity
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge>{selectedActivity.type}</Badge>
                  {selectedActivity.is_assigned && (
                    <Badge variant="destructive">Already Assigned</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="basic">
                <TabsList>
                  <TabsTrigger value="basic">Basic Settings</TabsTrigger>
                  <TabsTrigger value="objectives">
                    Learning Objectives
                  </TabsTrigger>
                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
                  <TabsTrigger value="rewards">Rewards</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Difficulty Level</Label>
                      <Select
                        value={quest.difficulty}
                        onValueChange={(value) =>
                          setQuest({ ...quest, difficulty: value as any })
                        }
                      >
                        <SelectTrigger id="difficulty">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Easy">Easy</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Hard">Hard</SelectItem>
                          <SelectItem value="Epic">Epic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="base-xp">Base XP Award</Label>
                      <Input
                        id="base-xp"
                        type="number"
                        value={quest.xp}
                        onChange={(e) =>
                          setQuest({
                            ...quest,
                            xp: Number.parseInt(e.target.value) || 0,
                          })
                        }
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">
                      Description Override (Optional)
                    </Label>
                    <Textarea
                      id="description"
                      value={quest.description}
                      onChange={(e) =>
                        setQuest({ ...quest, description: e.target.value })
                      }
                      placeholder="Leave empty to use the original Moodle description"
                      rows={3}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="objectives" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Learning Objectives</Label>
                    <div className="flex space-x-2">
                      <Input
                        value={newObjective}
                        onChange={(e) => setNewObjective(e.target.value)}
                        placeholder="Add a learning objective"
                      />
                      <Button
                        type="button"
                        onClick={addLearningObjective}
                        size="sm"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {quest.learningObjectives?.map((objective, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {objective}
                          <button
                            type="button"
                            onClick={() => removeLearningObjective(index)}
                            className="ml-1 rounded-full hover:bg-muted p-1"
                            aria-label={`Remove objective: ${objective}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="tasks" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>
                      Tasks (Students must complete these to finish the quest)
                    </Label>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
                      <div className="sm:col-span-3">
                        {" "}
                        <Select
                          value={newTask.description || "view_lesson"}
                          onValueChange={(value) => {
                            console.log("Selected task type:", value);
                            setNewTask({
                              ...newTask,
                              description: value,
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select task type" />
                          </SelectTrigger>
                          <SelectContent>
                            {TASK_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type
                                  .replace(/_/g, " ")
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Input
                          type="number"
                          value={newTask.xpReward}
                          onChange={(e) =>
                            setNewTask({
                              ...newTask,
                              xpReward: Number.parseInt(e.target.value) || 0,
                            })
                          }
                          placeholder="XP"
                          min="0"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={addTask}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Task
                    </Button>

                    <div className="space-y-2 mt-2">
                      {quest.tasks?.map((task, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 border rounded-md"
                        >
                          <div className="flex-1">
                            <div className="font-medium">
                              {typeof task.description === "string"
                                ? task.description
                                    .replace(/_/g, " ")
                                    .replace(/\b\w/g, (l) => l.toUpperCase())
                                : ""}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {task.xpReward} XP
                            </div>
                          </div>
                          <Button
                            type="button"
                            onClick={() => removeTask(index)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="rewards" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Rewards (What students earn upon completion)</Label>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      <div>
                        <Select
                          value={newReward.type}
                          onValueChange={(value) =>
                            setNewReward({ ...newReward, type: value as any })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Badge Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="achievement">
                              Achievement Badge
                            </SelectItem>
                            <SelectItem value="progress">
                              Progress Badge
                            </SelectItem>
                            <SelectItem value="participation">
                              Participation Badge
                            </SelectItem>
                            <SelectItem value="special">
                              Special Badge
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="sm:col-span-2">
                        <Input
                          value={newReward.name}
                          onChange={(e) =>
                            setNewReward({ ...newReward, name: e.target.value })
                          }
                          placeholder="Select or enter badge name"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={addReward}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Assign Badge
                    </Button>

                    <div className="space-y-2 mt-2">
                      {quest.rewards?.map((reward, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 border rounded-md"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{reward.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {reward.type.charAt(0).toUpperCase() +
                                reward.type.slice(1)}{" "}
                              Badge
                            </div>
                          </div>
                          <Button
                            type="button"
                            onClick={() => removeReward(index)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={selectedActivity.is_assigned}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {selectedActivity.is_assigned
                  ? "Already Assigned to Students"
                  : "Assign Quest to Students"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}
    </div>
  );
}

interface Quest {
  id: string;
  title: string;
  description: string;
  xp: number;
  progress: number;
  difficulty: "Easy" | "Medium" | "Hard" | "Epic";
  category: string;
  moodleCourse: number;
  moodleActivityId: number;
  deadline: string | null;
  status: string;
  creatorId: number;
  learningObjectives?: string[];
  tasks: Task[];
  rewards: Reward[];
}
