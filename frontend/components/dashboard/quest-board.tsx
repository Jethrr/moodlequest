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

        if (response.success) {
          // Update quest statistics
          setQuestStats({
            total: response.total_quests,
            completed: response.completed_quests,
            incomplete: response.incomplete_quests,
            completionRate: response.completion_rate,
          });

          // Combine completed and incomplete quests into a single array
          const allQuests = [
            ...response.quests.completed,
            ...response.quests.incomplete,
          ];

          // Map the API response to the Quest interface
          setQuests(
            allQuests.map((q: any) => ({
              id: q.quest_id?.toString() || "",
              title: q.title,
              description: q.description,
              xp: q.exp_reward,
              progress: q.progress_percent || 0,
              difficulty:
                q.difficulty_level === 1
                  ? "Easy"
                  : q.difficulty_level === 2
                  ? "Medium"
                  : "Hard",
              category: q.quest_type || "",
              deadline: q.end_date
                ? new Date(q.end_date).toLocaleDateString()
                : "",
              status: q.status as "not-started" | "in-progress" | "completed",
              course_title: q.course_title,
              validation_criteria: q.validation_criteria,
              is_completed: q.is_completed,
              started_at: q.started_at,
              completed_at: q.completed_at,
              validated_at: q.validated_at,
              validation_notes: q.validation_notes,
            }))
          );
        } else {
          setQuests([]);
          setQuestStats({
            total: 0,
            completed: 0,
            incomplete: 0,
            completionRate: 0,
          });
        }
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
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Quest Board</h2>
            <p className="text-muted-foreground">
              Complete quests to earn XP and level up your learning journey.
            </p>
          </div>
          {questStats.total > 0 && (
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {questStats.completionRate}%
              </div>
              <div className="text-sm text-muted-foreground">
                {questStats.completed}/{questStats.total} completed
              </div>
            </div>
          )}
        </div>
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
                `(${quests.filter((q) => q.status === "not-started").length})`}
            </TabsTrigger>
            <TabsTrigger value="in-progress">
              In Progress{" "}
              {questStats.total > 0 &&
                `(${quests.filter((q) => q.status === "in-progress").length})`}
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed{" "}
              {questStats.completed > 0 && `(${questStats.completed})`}
            </TabsTrigger>
          </TabsList>
        </motion.div>{" "}
        <TabsContent value={activeTab} className="mt-6">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="h-[300px] animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-2 bg-gray-200 rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            ) : filteredQuests.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="mb-4">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeTab === "all"
                    ? "No quests available"
                    : `No ${activeTab.replace("-", " ")} quests`}
                </h3>
                <p className="text-gray-500">
                  {activeTab === "all"
                    ? "Check back later for new quests to complete."
                    : `You don't have any ${activeTab.replace(
                        "-",
                        " "
                      )} quests at the moment.`}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {" "}
                {filteredQuests.map((quest) => (
                  <motion.div
                    key={quest.id}
                    variants={cardVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className={`overflow-hidden h-[300px] flex flex-col relative ${
                        quest.status === "completed"
                          ? "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20"
                          : quest.status === "in-progress"
                          ? "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20"
                          : "border-gray-200"
                      }`}
                    >
                      {/* Status indicator */}
                      <div
                        className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
                          quest.status === "completed"
                            ? "bg-green-500"
                            : quest.status === "in-progress"
                            ? "bg-blue-500"
                            : "bg-gray-300"
                        }`}
                      />

                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="w-full pr-2">
                            {" "}
                            <CardTitle
                              className={`text-lg font-bold  break-words ${
                                quest.status === "completed"
                                  ? "text-green-700"
                                  : ""
                              }`}
                            >
                              {quest.title}
                              {quest.status === "completed" && (
                                <svg
                                  className="inline-block ml-2 h-4 w-4 text-green-600"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  {/* <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  /> */}
                                </svg>
                              )}
                            </CardTitle>
                          </div>
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
                        </div>{" "}
                        <CardDescription className="line-clamp-2 h-[40px] mt-1">
                          {quest.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2 flex-grow">
                        <div className="space-y-2">
                          {" "}
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
                          {/* Status badge */}
                          <div className="flex justify-between items-center">
                            {/* <Badge
                              variant={
                                quest.status === "completed"
                                  ? "default"
                                  : quest.status === "in-progress"
                                  ? "secondary"
                                  : "outline"
                              }
                              className={`text-xs ${
                                quest.status === "completed"
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : quest.status === "in-progress"
                                  ? "bg-blue-100 text-blue-800 border-blue-200"
                                  : "bg-gray-100 text-gray-800 border-gray-200"
                              }`}
                            >
                              {quest.status === "not-started"
                                ? "Not Started"
                                : quest.status === "in-progress"
                                ? "In Progress"
                                : "Completed"}
                            </Badge> */}
                            {quest.course_title && (
                              <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                                {quest.course_title}
                              </span>
                            )}
                          </div>
                          <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: quest.progress / 100 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          >
                            <Progress
                              value={quest.progress}
                              className={`h-2 ${
                                quest.status === "completed"
                                  ? "bg-green-100"
                                  : ""
                              }`}
                            />
                            {quest.progress > 0 && (
                              <span className="text-xs text-muted-foreground mt-1 block">
                                {quest.progress}% complete
                              </span>
                            )}
                          </motion.div>
                        </div>
                      </CardContent>
                      <CardFooter className="mt-auto pt-2">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full"
                        >
                          {" "}
                          <Button
                            variant={
                              quest.status === "completed"
                                ? "outline"
                                : quest.status === "in-progress"
                                ? "secondary"
                                : "default"
                            }
                            className={`w-full ${
                              quest.status === "completed"
                                ? "border-green-300 text-green-700 hover:bg-green-50"
                                : quest.status === "in-progress"
                                ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                : ""
                            }`}
                            onClick={() => openQuestModal(quest)}
                          >
                            {quest.status === "in-progress"
                              ? "Continue Quest"
                              : "View Quest"}
                          </Button>
                        </motion.div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
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
