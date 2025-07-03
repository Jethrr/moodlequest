import { useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

export interface BadgeRewardData {
  badgeId: number;
  name: string;
  description: string;
  imageUrl?: string;
  expBonus: number;
  badgeType: string;
}

export function useBadgeReward() {
  const [isVisible, setIsVisible] = useState(false);
  const [rewardData, setRewardData] = useState<BadgeRewardData | null>(null);
  const [pendingBadges, setPendingBadges] = useState<BadgeRewardData[]>([]);

  const showBadgeReward = useCallback(
    (data: BadgeRewardData) => {
      // If a badge is currently being shown, queue this one
      if (isVisible) {
        setPendingBadges((prev) => [...prev, data]);
        return;
      }

      setRewardData(data);
      setIsVisible(true);

      // Also show a toast notification
      toast({
        title: "🏆 Badge Earned!",
        description: `${data.name} - ${data.expBonus} bonus XP`,
        duration: 4000,
      });
    },
    [isVisible]
  );

  const hideBadgeReward = useCallback(() => {
    setIsVisible(false);

    // Clear current data after animation completes
    setTimeout(() => {
      setRewardData(null);

      // Show next badge if any are pending
      setPendingBadges((prev) => {
        if (prev.length > 0) {
          const nextBadge = prev[0];
          const remaining = prev.slice(1);

          // Show the next badge after a brief delay
          setTimeout(() => {
            setRewardData(nextBadge);
            setIsVisible(true);
          }, 500);

          return remaining;
        }
        return prev;
      });
    }, 300);
  }, []);

  // Helper function to show multiple badges earned at once
  const showMultipleBadges = useCallback(
    (badges: BadgeRewardData[]) => {
      if (badges.length === 0) return;

      // Show the first badge immediately
      showBadgeReward(badges[0]);

      // Queue the rest
      if (badges.length > 1) {
        setPendingBadges((prev) => [...prev, ...badges.slice(1)]);
      }

      // Show summary toast for multiple badges
      if (badges.length > 1) {
        toast({
          title: "🎉 Multiple Badges Earned!",
          description: `You earned ${
            badges.length
          } badges! Total bonus: ${badges.reduce(
            (sum, b) => sum + b.expBonus,
            0
          )} XP`,
          duration: 6000,
        });
      }
    },
    [showBadgeReward]
  );

  // Helper function to create badge reward data from API response
  const createBadgeData = useCallback(
    (badge: any, expBonus: number = 0): BadgeRewardData => {
      return {
        badgeId: badge.badge_id || badge.id,
        name: badge.name,
        description: badge.description,
        imageUrl: badge.image_url,
        expBonus: expBonus,
        badgeType: badge.badge_type || "achievement",
      };
    },
    []
  );

  return {
    isVisible,
    rewardData,
    pendingBadges: pendingBadges.length,
    showBadgeReward,
    hideBadgeReward,
    showMultipleBadges,
    createBadgeData,
  };
}

// Hook for integrating badge checking with quest completion
export function useQuestBadgeIntegration() {
  const { showMultipleBadges, createBadgeData } = useBadgeReward();

  const handleQuestCompletion = useCallback(
    async (questResponse: any) => {
      // Check if the quest completion response includes badge information
      if (questResponse.badges_earned && questResponse.badges_earned > 0) {
        const badgeData =
          questResponse.badge_details?.map((badge: any) =>
            createBadgeData(badge, badge.exp_bonus)
          ) || [];

        if (badgeData.length > 0) {
          showMultipleBadges(badgeData);
        }
      }
    },
    [showMultipleBadges, createBadgeData]
  );

  const handleDailyQuestCompletion = useCallback(
    async (dailyQuestResponse: any) => {
      // For daily quests, we might need to manually check badges
      // since the daily quest service should have already checked them
      // But we can add explicit badge checking here if needed

      // If the response includes badge information, show them
      if (dailyQuestResponse.badges_earned) {
        const badgeData =
          dailyQuestResponse.badge_details?.map((badge: any) =>
            createBadgeData(badge, badge.exp_bonus)
          ) || [];

        if (badgeData.length > 0) {
          showMultipleBadges(badgeData);
        }
      }
    },
    [showMultipleBadges, createBadgeData]
  );

  return {
    handleQuestCompletion,
    handleDailyQuestCompletion,
  };
}
