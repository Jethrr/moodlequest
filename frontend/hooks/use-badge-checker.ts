"use client";

import { useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { BadgeCheckResult } from "@/types/badges";
import { toast } from "@/hooks/use-toast";

export function useBadgeChecker() {
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckResult, setLastCheckResult] =
    useState<BadgeCheckResult | null>(null);

  const checkAllBadges = useCallback(
    async (userId: number, courseId?: number) => {
      setIsChecking(true);
      try {
        const result = await apiClient.checkAllBadgesForUser(userId, courseId);
        setLastCheckResult(result);

        // Show notifications for newly awarded badges
        if (result.newly_awarded > 0) {
          result.badges.forEach((badge: any) => {
            toast({
              title: "🎉 Badge Earned!",
              description: `You've earned the "${badge.name}" badge! (+${badge.exp_bonus} XP)`,
              duration: 5000,
            });
          });
        }

        return result;
      } catch (error) {
        console.error("Failed to check badges:", error);
        toast({
          title: "Error",
          description: "Failed to check for new badges",
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsChecking(false);
      }
    },
    []
  );

  const triggerEventBasedCheck = useCallback(
    async (eventData: {
      user_id: number;
      event_type:
        | "quest_completed"
        | "login"
        | "xp_earned"
        | "daily_quest_completed";
      course_id?: number;
      metadata?: any;
    }) => {
      setIsChecking(true);
      try {
        const result = await apiClient.triggerBadgeCheck(eventData);
        setLastCheckResult(result);

        // Show notifications for newly awarded badges
        if (result.newly_awarded > 0) {
          result.badges.forEach((badge: any) => {
            toast({
              title: "🎉 Badge Earned!",
              description: `You've earned the "${badge.name}" badge! (+${badge.exp_bonus} XP)`,
              duration: 5000,
            });
          });
        }

        return result;
      } catch (error) {
        console.error("Failed to trigger badge check:", error);
        throw error;
      } finally {
        setIsChecking(false);
      }
    },
    []
  );

  const checkSpecificBadge = useCallback(
    async (userId: number, badgeId: number) => {
      try {
        const result = await apiClient.checkSpecificBadgeCriteria(
          userId,
          badgeId
        );
        return result;
      } catch (error) {
        console.error("Failed to check specific badge:", error);
        throw error;
      }
    },
    []
  );

  // Utility functions for common events
  const onQuestCompleted = useCallback(
    (userId: number, courseId?: number, questId?: number) => {
      return triggerEventBasedCheck({
        user_id: userId,
        event_type: "quest_completed",
        course_id: courseId,
        metadata: { quest_id: questId },
      });
    },
    [triggerEventBasedCheck]
  );

  const onUserLogin = useCallback(
    (userId: number) => {
      return triggerEventBasedCheck({
        user_id: userId,
        event_type: "login",
      });
    },
    [triggerEventBasedCheck]
  );

  const onXpEarned = useCallback(
    (userId: number, xpAmount: number, courseId?: number) => {
      return triggerEventBasedCheck({
        user_id: userId,
        event_type: "xp_earned",
        course_id: courseId,
        metadata: { xp_amount: xpAmount },
      });
    },
    [triggerEventBasedCheck]
  );

  const onDailyQuestCompleted = useCallback(
    (userId: number, questId: number) => {
      return triggerEventBasedCheck({
        user_id: userId,
        event_type: "daily_quest_completed",
        metadata: { quest_id: questId },
      });
    },
    [triggerEventBasedCheck]
  );

  return {
    // State
    isChecking,
    lastCheckResult,

    // General badge checking
    checkAllBadges,
    triggerEventBasedCheck,
    checkSpecificBadge,

    // Event-specific utilities
    onQuestCompleted,
    onUserLogin,
    onXpEarned,
    onDailyQuestCompleted,
  };
}

// Example usage:
/*
const { onQuestCompleted, onUserLogin, isChecking } = useBadgeChecker();

// When a quest is completed
await onQuestCompleted(userId, courseId, questId);

// When user logs in
await onUserLogin(userId);

// When XP is earned
await onXpEarned(userId, 100, courseId);
*/
