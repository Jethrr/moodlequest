import { useState, useCallback, useEffect } from "react";
import { getLevelInfo } from "@/lib/leveling-system";
import {
  useSSENotifications,
  SSENotificationData,
} from "./use-sse-notifications";

export interface XPRewardData {
  xpEarned: number;
  taskTitle: string;
  currentXP: number;
  previousXP: number;
  currentLevel: number;
  xpToNextLevel: number;
  maxXP: number;
  sourceType?: string;
  isRealTime?: boolean;
}

export function useRealtimeXPReward() {
  const [isVisible, setIsVisible] = useState(false);
  const [rewardData, setRewardData] = useState<XPRewardData | null>(null);
  const [notificationQueue, setNotificationQueue] = useState<XPRewardData[]>(
    []
  );
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);

  const { connectionState, addNotificationHandler, removeNotificationHandler } =
    useSSENotifications();

  // Show XP reward popup
  const showXPReward = useCallback((data: XPRewardData) => {
    setRewardData(data);
    setIsVisible(true);
  }, []);

  // Hide XP reward popup
  const hideXPReward = useCallback(() => {
    setIsVisible(false);
    // Clear data after animation completes
    setTimeout(() => setRewardData(null), 300);
  }, []);

  // Helper function to calculate levels and progress from XP
  const createRewardData = useCallback(
    (
      xpEarned: number,
      taskTitle: string,
      totalXP: number,
      sourceType: string = "manual",
      isRealTime: boolean = false
    ): XPRewardData => {
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
        sourceType,
        isRealTime,
      };
    },
    []
  );

  // Process notification queue
  const processNotificationQueue = useCallback(async () => {
    if (isProcessingQueue || notificationQueue.length === 0 || isVisible) {
      return;
    }

    setIsProcessingQueue(true);
    const nextNotification = notificationQueue[0];

    // Remove from queue
    setNotificationQueue((prev) => prev.slice(1));

    // Show the notification
    showXPReward(nextNotification);

    // Wait for the notification to be dismissed before processing the next one
    // The queue will be processed again when hideXPReward is called
    setIsProcessingQueue(false);
  }, [isProcessingQueue, notificationQueue, isVisible, showXPReward]);

  // Add notification to queue
  const addToQueue = useCallback((rewardData: XPRewardData) => {
    setNotificationQueue((prev) => [...prev, rewardData]);
  }, []);
  // Handle SSE XP reward notifications
  const handleXPNotification = useCallback(
    (notification: SSENotificationData) => {
      console.log("Received XP notification:", notification);

      if (
        !notification.xp_earned ||
        !notification.quest_data?.quest_title ||
        !notification.total_xp
      ) {
        console.warn("Invalid XP notification data:", notification);
        return;
      }

      const rewardData = createRewardData(
        notification.xp_earned,
        notification.quest_data.quest_title,
        notification.total_xp,
        notification.quest_data.source_type || "real_time",
        true
      );

      // Add to queue if popup is already visible, otherwise show immediately
      if (isVisible) {
        addToQueue(rewardData);
      } else {
        showXPReward(rewardData);
      }
    },
    [createRewardData, isVisible, addToQueue, showXPReward]
  );

  // Enhanced hide function that processes queue
  const hideXPRewardAndProcessQueue = useCallback(() => {
    hideXPReward();
    // Process next notification after a short delay
    setTimeout(() => {
      processNotificationQueue();
    }, 500);
  }, [hideXPReward, processNotificationQueue]);

  // Set up SSE notification handler
  useEffect(() => {
    addNotificationHandler("xp_reward", handleXPNotification);

    return () => {
      removeNotificationHandler("xp_reward");
    };
  }, [addNotificationHandler, removeNotificationHandler, handleXPNotification]);

  // Process queue when it changes and we're not already processing
  useEffect(() => {
    if (!isVisible && !isProcessingQueue) {
      processNotificationQueue();
    }
  }, [
    notificationQueue,
    isVisible,
    isProcessingQueue,
    processNotificationQueue,
  ]);

  // Manual trigger for non-SSE XP rewards (backward compatibility)
  const triggerXPReward = useCallback(
    (
      xpEarned: number,
      taskTitle: string,
      totalXP: number,
      sourceType: string = "manual"
    ) => {
      const rewardData = createRewardData(
        xpEarned,
        taskTitle,
        totalXP,
        sourceType,
        false
      );

      if (isVisible) {
        addToQueue(rewardData);
      } else {
        showXPReward(rewardData);
      }
    },
    [createRewardData, isVisible, addToQueue, showXPReward]
  );

  return {
    // Display state
    isVisible,
    rewardData,

    // Queue management
    notificationQueue,
    queueLength: notificationQueue.length,

    // Connection state
    connectionState,
    isConnected: connectionState.isConnected,

    // Actions
    showXPReward,
    hideXPReward: hideXPRewardAndProcessQueue,
    triggerXPReward,
    createRewardData,

    // Queue actions
    clearQueue: () => setNotificationQueue([]),
  };
}
