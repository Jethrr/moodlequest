import { useState, useCallback } from "react";
import { getLevelInfo } from "@/lib/leveling-system";

export interface XPRewardData {
  xpEarned: number;
  taskTitle: string;
  currentXP: number;
  previousXP: number;
  currentLevel: number;
  xpToNextLevel: number;
  maxXP: number;
}

export function useXPReward() {
  const [isVisible, setIsVisible] = useState(false);
  const [rewardData, setRewardData] = useState<XPRewardData | null>(null);

  const showXPReward = useCallback((data: XPRewardData) => {
    setRewardData(data);
    setIsVisible(true);
  }, []);

  const hideXPReward = useCallback(() => {
    setIsVisible(false);
    // Clear data after animation completes
    setTimeout(() => setRewardData(null), 300);
  }, []);
  // Helper function to calculate levels and progress from XP using the comprehensive leveling system
  const createRewardData = useCallback(
    (xpEarned: number, taskTitle: string, totalXP: number): XPRewardData => {
      const previousXP = totalXP - xpEarned;
      const currentLevelInfo = getLevelInfo(totalXP);
      const previousLevelInfo = getLevelInfo(previousXP);

      return {
        xpEarned,
        taskTitle,
        currentXP: totalXP,
        previousXP,
        currentLevel: currentLevelInfo.level,
        xpToNextLevel:
          currentLevelInfo.xpForNextLevel - currentLevelInfo.xpProgress,
        maxXP:
          currentLevelInfo.xpForNextLevel - currentLevelInfo.xpForCurrentLevel,
      };
    },
    []
  );

  return {
    isVisible,
    rewardData,
    showXPReward,
    hideXPReward,
    createRewardData,
  };
}
