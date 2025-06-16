import React, { createContext, useContext, ReactNode } from "react";
import { XPRewardPopup } from "@/components/ui/xp-reward-popup";
import { useRealtimeXPReward, XPRewardData } from "@/hooks/use-realtime-xp-reward";

interface XPRewardContextValue {
  isVisible: boolean;
  rewardData: XPRewardData | null;
  queueLength: number;
  isConnected: boolean;
  showXPReward: (data: XPRewardData) => void;
  triggerXPReward: (xpEarned: number, taskTitle: string, totalXP: number, sourceType?: string) => void;
  createRewardData: (xpEarned: number, taskTitle: string, totalXP: number, sourceType?: string, isRealTime?: boolean) => XPRewardData;
  clearQueue: () => void;
}

const XPRewardContext = createContext<XPRewardContextValue | undefined>(undefined);

interface XPRewardProviderProps {
  children: ReactNode;
}

export function XPRewardProvider({ children }: XPRewardProviderProps) {
  const {
    isVisible,
    rewardData,
    queueLength,
    isConnected,
    showXPReward,
    hideXPReward,
    triggerXPReward,
    createRewardData,
    clearQueue,
  } = useRealtimeXPReward();

  const contextValue: XPRewardContextValue = {
    isVisible,
    rewardData,
    queueLength,
    isConnected,
    showXPReward,
    triggerXPReward,
    createRewardData,
    clearQueue,
  };

  return (
    <XPRewardContext.Provider value={contextValue}>
      {children}
      {/* Global XP Reward Popup */}
      {rewardData && (
        <XPRewardPopup
          isOpen={isVisible}
          onCloseAction={hideXPReward}
          xpEarned={rewardData.xpEarned}
          taskTitle={rewardData.taskTitle}
          currentXP={rewardData.currentXP}
          previousXP={rewardData.previousXP}
          currentLevel={rewardData.currentLevel}
          xpToNextLevel={rewardData.xpToNextLevel}
          maxXP={rewardData.maxXP}
        />
      )}
    </XPRewardContext.Provider>
  );
}

// Hook to use the XP reward context
export function useXPRewardContext() {
  const context = useContext(XPRewardContext);
  if (context === undefined) {
    throw new Error("useXPRewardContext must be used within an XPRewardProvider");
  }
  return context;
}

// Backward compatibility hook that mimics the original useXPReward interface
export function useGlobalXPReward() {
  const context = useXPRewardContext();
  
  return {
    isVisible: context.isVisible,
    rewardData: context.rewardData,
    showXPReward: context.showXPReward,
    hideXPReward: () => {
      // Hide functionality is handled internally by the provider
      console.log("hideXPReward called - popup will close automatically");
    },
    createRewardData: context.createRewardData,
    // Additional real-time features
    triggerXPReward: context.triggerXPReward,
    queueLength: context.queueLength,
    isConnected: context.isConnected,
    clearQueue: context.clearQueue,
  };
}
