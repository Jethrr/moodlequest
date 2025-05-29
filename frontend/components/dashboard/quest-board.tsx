"use client";

import { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { QuestModal } from "@/components/dashboard/quest-modal";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

interface Quest {
  id: string;
  title: string;
  description: string;
  xp: number;
  progress: number;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  deadline: string;
  status: "not-started" | "in-progress" | "completed";
  course_title?: string;
  validation_criteria?: string;
  is_completed: boolean;
  started_at?: string;
  completed_at?: string;
  validated_at?: string;
  validation_notes?: string;
}

interface QuestApiResponse {
  success: boolean;
  user_id: number;
  total_quests: number;
  completed_quests: number;
  incomplete_quests: number;
  completion_rate: number;
  quests: {
    completed: any[];
    incomplete: any[];
  };
}

export function QuestBoard() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [questStats, setQuestStats] = useState({
    total: 0,
    completed: 0,
    incomplete: 0,
    completionRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  useEffect(() => {
    async function fetchQuests() {
      if (!user) return;

      setIsLoading(true);
      try {
        // Fetch quests for the logged-in user with completion status
        const response = await apiClient.request<QuestApiResponse>(
          `/quests/for-user/${user.id}`,
          "GET"
        );

        // Update quest statistics
        setQuestStats({
          total: response.total_quests,
          completed: response.completed_quests,
          incomplete: response.incomplete_quests,
          completionRate: response.completion_rate,
        });

        // Transform and combine completed and incomplete quests
        const allQuests = [
          ...response.quests.completed.map((q: any) => transformQuest(q, true)),
          ...response.quests.incomplete.map((q: any) =>
            transformQuest(q, false)
          ),
        ];

        setQuests(allQuests);
      } catch (err) {
        console.error("Failed to fetch quests for user", err);
        setQuests([]);
        setQuestStats({
          total: 0,
          completed: 0,
          incomplete: 0,
          completionRate: 0,
        });
      } finally {
        setIsLoading(false);
      }
    }

    // Helper function to transform quest data
    function transformQuest(q: any, isCompleted: boolean): Quest {
      return {
        id: q.quest_id?.toString() || "",
        title: q.title,
        description: q.description,
        xp: q.exp_reward || 0,
        progress: q.progress_percent || 0,
        difficulty:
          q.difficulty_level === 1
            ? "Easy"
            : q.difficulty_level === 2
            ? "Medium"
            : "Hard",
        category: q.quest_type || "",
        deadline: q.end_date ? new Date(q.end_date).toLocaleDateString() : "",
        status:
          q.status === "completed"
            ? "completed"
            : q.status === "in_progress" || q.progress_percent > 0
            ? "in-progress"
            : "not-started",
        course_title: q.course_title,
        validation_criteria: q.validation_criteria,
        is_completed: isCompleted,
        started_at: q.started_at,
        completed_at: q.completed_at,
        validated_at: q.validated_at,
        validation_notes: q.validation_notes,
      };
    }

    fetchQuests();
  }, [user]);

  const filteredQuests =
    activeTab === "all"
      ? quests
      : quests.filter((quest) => quest.status === activeTab);

  const openQuestModal = (quest: Quest) => {
    setSelectedQuest(quest);
    setIsModalOpen(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const tabVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 200,
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {" "}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2"
      >
        <h2 className="text-3xl font-bold tracking-tight">Quest Board</h2>
        <p className="text-muted-foreground">
          Complete quests to earn XP and level up your learning journey.
        </p>
        {questStats.total > 0 && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Total: {questStats.total}</span>
            <span>Completed: {questStats.completed}</span>
            <span>Completion Rate: {questStats.completionRate}%</span>
          </div>
        )}
      </motion.div>
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <motion.div variants={tabVariants} initial="hidden" animate="visible">
          <TabsList>
            <TabsTrigger value="all">
              All Quests {questStats.total > 0 && `(${questStats.total})`}
            </TabsTrigger>
            <TabsTrigger value="not-started">
              Not Started{" "}
              {questStats.total > 0 &&
                `(${
                  questStats.total -
                  questStats.completed -
                  quests.filter((q) => q.status === "in-progress").length
                })`}
            </TabsTrigger>
            <TabsTrigger value="in-progress">
              In Progress{" "}
              {questStats.total > 0 &&
                `(${quests.filter((q) => q.status === "in-progress").length})`}
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed {questStats.total > 0 && `(${questStats.completed})`}
            </TabsTrigger>
          </TabsList>
        </motion.div>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-[300px] bg-muted animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : filteredQuests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-muted-foreground text-lg font-medium">
                {activeTab === "all"
                  ? "No quests available"
                  : `No ${activeTab.replace("-", " ")} quests`}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {activeTab === "all"
                  ? "Check back later for new quests from your enrolled courses."
                  : "Try switching to another tab to see more quests."}
              </p>{" "}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {filteredQuests.map((quest) => (
                  <motion.div
                    key={quest.id}
                    variants={cardVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >                    <Card
                      className={`overflow-hidden h-[300px] flex flex-col relative ${
                        quest.is_completed
                          ? "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20"
                          : quest.status === "in-progress"
                          ? "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20"
                          : "border-border"
                      }`}
                    >                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="w-full pr-2">
                            <CardTitle
                              className={`text-lg font-bold hover:text-primary break-words ${
                                quest.is_completed
                                  ? "text-green-700 dark:text-green-300"
                                  : ""
                              }`}
                            >
                              {quest.title}
                            </CardTitle>
                          </div>
                          <div className="flex flex-col gap-1">
                            <motion.div whileHover={{ scale: 1.1 }}>
                              <Badge
                                variant={
                                  quest.difficulty === "Easy"
                                    ? "outline"
                                    : quest.difficulty === "Medium"
                                    ? "secondary"
                                    : "destructive"
                                }
                              >
                                {quest.difficulty}
                              </Badge>
                            </motion.div>
                          </div>
                        </div>
                        <CardDescription className="line-clamp-2 h-[40px] mt-1">
                          {quest.description}
                        </CardDescription>
                        {quest.course_title && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                            </svg>
                            {quest.course_title}
                          </div>
                        )}
                      </CardHeader>{" "}
                      <CardContent className="pb-2 flex-grow">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <motion.div
                              className="flex items-center"
                              whileHover={{ scale: 1.1 }}
                            >
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
                                className="h-4 w-4 mr-1 text-yellow-500"
                              >
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                              <span>{quest.xp} XP</span>
                            </motion.div>
                            <span className="text-muted-foreground truncate max-w-[120px]">
                              {quest.deadline}
                            </span>
                          </div>
                          <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: quest.progress / 100 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="relative"
                          >
                            <Progress
                              value={quest.progress}
                              className={`h-2 ${
                                quest.is_completed
                                  ? "[&>div]:bg-green-500"
                                  : quest.status === "in-progress"
                                  ? "[&>div]:bg-blue-500"
                                  : "[&>div]:bg-gray-400"
                              }`}
                            />
                          </motion.div>
                          {quest.is_completed && quest.completed_at && (
                            <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                              </svg>
                              Completed:{" "}
                              {new Date(
                                quest.completed_at
                              ).toLocaleDateString()}
                            </div>
                          )}
                          {quest.status === "in-progress" &&
                            quest.started_at && (
                              <div className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <circle cx="12" cy="12" r="10" />
                                  <polyline points="12 6 12 12 16 14" />
                                </svg>
                                Started:{" "}
                                {new Date(
                                  quest.started_at
                                ).toLocaleDateString()}
                              </div>
                            )}
                        </div>
                      </CardContent>{" "}
                      <CardFooter className="mt-auto pt-2">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full"
                        >
                          <Button
                            variant={
                              quest.status === "completed"
                                ? "outline"
                                : "default"
                            }
                            className={`w-full ${
                              quest.is_completed
                                ? "border-green-500 text-green-700 hover:bg-green-50 dark:text-green-300 dark:hover:bg-green-950/20"
                                : quest.status === "in-progress"
                                ? "bg-blue-500 hover:bg-blue-600 text-white"
                                : ""
                            }`}
                            onClick={() => openQuestModal(quest)}
                          >
                            {quest.is_completed ? (
                              <div className="flex items-center gap-2">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                View Completed Quest
                              </div>
                            ) : quest.status === "in-progress" ? (
                              <div className="flex items-center gap-2">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <circle cx="12" cy="12" r="1" />
                                  <circle cx="19" cy="12" r="1" />
                                  <circle cx="5" cy="12" r="1" />
                                </svg>
                                Continue Quest
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <circle cx="12" cy="12" r="10" />
                                  <polygon points="10 8 16 12 10 16 10 8" />
                                </svg>
                                Start Quest
                              </div>
                            )}
                          </Button>
                        </motion.div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </TabsContent>
      </Tabs>
      {isModalOpen && selectedQuest && (
        <QuestModal
          quest={selectedQuest}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </motion.div>
  );
}
