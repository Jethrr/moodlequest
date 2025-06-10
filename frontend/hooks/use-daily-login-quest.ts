"use client";

import { useEffect, useRef } from "react";
import { useCurrentUser } from "@/hooks/useCurrentMoodleUser";
import { apiClient } from "@/lib/api-client";
import { toast } from "@/hooks/use-toast";

export function useDailyLoginQuest() {
  const { user } = useCurrentUser();
  const hasCompletedToday = useRef<string | null>(null);

  useEffect(() => {
    const completeLoginQuest = async () => {
      if (!user?.id) return;

      const today = new Date().toDateString();

      // Prevent multiple completion attempts on the same day
      if (hasCompletedToday.current === today) return;

      try {
        // Ensure quest templates are seeded (this is idempotent)
        await apiClient.seedDailyQuests();

        // Complete the daily login quest
        const result = await apiClient.completeDailyQuest(
          user.id,
          "daily_login"
        );

        if (result.success) {
          toast({
            title: "Welcome back! 🎉",
            description: `Daily login completed! You earned ${result.xp_awarded} XP`,
          });
        }

        hasCompletedToday.current = today;
      } catch (error) {
        console.error("Failed to complete daily login quest:", error);
        // Don't show error toast for login quest completion failure
        // as it might be already completed or other non-critical issues
      }
    };

    // Small delay to ensure user data is fully loaded
    const timer = setTimeout(completeLoginQuest, 2000);

    return () => clearTimeout(timer);
  }, [user?.id]);

  return null;
}
