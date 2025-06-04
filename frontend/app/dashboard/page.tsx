"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { QuestBoard } from "@/components/dashboard/quest-board";
import { VirtualPet } from "@/components/dashboard/virtual-pet";
import { Card } from "@/components/ui/card";
import { useStudentProtection } from "@/hooks/use-role-protection";
import { useCurrentUser } from "@/hooks/useCurrentMoodleUser";
import { apiClient, type StudentProgress } from "@/lib/api-client";

export default function DashboardPage() {
  // Protect this route for students - teachers will be redirected to /teacher/dashboard
  useStudentProtection("/teacher/dashboard");

  const { user, loading: userLoading } = useCurrentUser();
  // console.log("Current user:", user);
  const [studentProgress, setStudentProgress] =
    useState<StudentProgress | null>(null);
  const [progressLoading, setProgressLoading] = useState(true);
  const [progressError, setProgressError] = useState<string | null>(null);

  // Fetch student progress data
  useEffect(() => {
    const fetchProgress = async () => {
      if (!user?.id) {
        setProgressLoading(false);
        return;
      }

      try {
        setProgressLoading(true);
        const progress = await apiClient.fetchStudentProgress(user.id);
        setStudentProgress(progress);
        setProgressError(null);
      } catch (error) {
        console.error("Failed to fetch student progress:", error);
        setProgressError("Failed to load progress data");
      } finally {
        setProgressLoading(false);
      }
    };

    if (!userLoading && user) {
      fetchProgress();
    }
  }, [user, userLoading]);

  // Calculate current level based on XP (simple formula: level = floor(xp / 100) + 1)
  const calculateLevel = (xp: number) => Math.floor(xp / 100) + 1;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const hoverVariants = {
    hover: {
      scale: 1.02,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="container max-w-7xl mx-auto px-4 py-8"
    >
      {" "}
      {/* Welcome Section */}
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          Welcome back! 👋
        </h1>
        <p className="text-muted-foreground">
          Track your progress, complete quests, and level up your learning
          journey.
        </p>
        {progressError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">
              ⚠️ {progressError} - Showing default values
            </p>
          </div>
        )}
      </motion.div>
      <div className="grid gap-6 md:grid-cols-12">
        {/* Main Content Area - Left Side */}
        <motion.div variants={itemVariants} className="md:col-span-8 space-y-6">
          {" "}
          {/* Quick Stats */}
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
            <motion.div
              variants={hoverVariants}
              whileHover="hover"
              className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl p-4 text-white"
            >
              <h3 className="text-sm font-medium text-violet-100">Total XP</h3>
              <p className="text-2xl font-bold">
                {progressLoading ? "..." : studentProgress?.total_exp || 0}
              </p>
            </motion.div>
            <motion.div
              variants={hoverVariants}
              whileHover="hover"
              className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 text-white"
            >
              <h3 className="text-sm font-medium text-amber-100">
                Current Level
              </h3>
              <p className="text-2xl font-bold">
                {progressLoading
                  ? "..."
                  : calculateLevel(studentProgress?.total_exp || 0)}
              </p>
            </motion.div>
            <motion.div
              variants={hoverVariants}
              whileHover="hover"
              className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white"
            >
              <h3 className="text-sm font-medium text-emerald-100">
                Overall Quests Done
              </h3>
              <p className="text-2xl font-bold">
                {progressLoading
                  ? "..."
                  : studentProgress?.quests_completed || 0}
              </p>
            </motion.div>
            <motion.div
              variants={hoverVariants}
              whileHover="hover"
              className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white"
            >
              <h3 className="text-sm font-medium text-blue-100">
                Achievements
              </h3>
              <p className="text-2xl font-bold">
                {progressLoading ? "..." : studentProgress?.badges_earned || 0}
              </p>
            </motion.div>
          </div>
          {/* Quest Board Section */}
          <motion.div
            variants={hoverVariants}
            whileHover="hover"
            className="bg-card rounded-xl border shadow-sm overflow-hidden"
          >
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Active Quests</h2>
              <QuestBoard />
            </div>
          </motion.div>
        </motion.div>

        {/* Sidebar - Right Side */}
        <motion.div variants={itemVariants} className="md:col-span-4 space-y-6">
          {/* Virtual Pet Card */}
          <motion.div
            variants={hoverVariants}
            whileHover="hover"
            className="bg-card rounded-xl border shadow-sm overflow-hidden"
          >
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Your Pet</h2>
              <VirtualPet />
            </div>
          </motion.div>

          {/* Daily Tasks */}
          <motion.div
            variants={hoverVariants}
            whileHover="hover"
            className="bg-card rounded-xl border shadow-sm overflow-hidden"
          >
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Daily Tasks</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Complete 3 quests</p>
                    <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                      <div className="bg-green-500 h-1.5 rounded-full w-2/3"></div>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">2/3</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Earn 100 XP</p>
                    <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                      <div className="bg-blue-500 h-1.5 rounded-full w-1/4"></div>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">25/100</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
