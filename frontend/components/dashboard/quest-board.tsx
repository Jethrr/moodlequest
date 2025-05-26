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
}

export function QuestBoard() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quests, setQuests] = useState<Quest[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchQuests() {
      if (!user) return;
      try {
        // Fetch quests for the logged-in user (only those linked to Moodle activities)
        const response = await apiClient.request<any[]>(
          `/quests/for-user/${user.id}`,
          "GET"
        );
        setQuests(
          response.map((q: any) => ({
            id: q.quest_id?.toString() || q.id?.toString() || "",
            title: q.title,
            description: q.description,
            xp: q.exp_reward,
            progress: 0, // TODO: Map real progress if available
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
            status: "not-started", // TODO: Map real status if available
            validation_criteria: q.validation_criteria, // <-- Pass through validation_criteria for QuestModal
          }))
        );
      } catch (err) {
        console.error("Failed to fetch quests for user", err);
        setQuests([]);
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2"
      >
        <h2 className="text-3xl font-bold tracking-tight">Quest Board</h2>
        <p className="text-muted-foreground">
          Complete quests to earn XP and level up your learning journey.
        </p>
      </motion.div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <motion.div variants={tabVariants} initial="hidden" animate="visible">
          <TabsList>
            <TabsTrigger value="all">All Quests</TabsTrigger>
            <TabsTrigger value="not-started">Not Started</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </motion.div>

        <TabsContent value={activeTab} className="mt-6">
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
                >
                  <Card className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{quest.title}</CardTitle>
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
                      <CardDescription>{quest.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="space-y-3">
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
                          <span className="text-muted-foreground">
                            {quest.deadline}
                          </span>
                        </div>
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: quest.progress / 100 }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                          <Progress value={quest.progress} className="h-2" />
                        </motion.div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full"
                      >
                        <Button
                          variant={
                            quest.status === "completed" ? "outline" : "default"
                          }
                          className="w-full"
                          onClick={() => openQuestModal(quest)}
                        >
                          View Details
                        </Button>
                      </motion.div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
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
