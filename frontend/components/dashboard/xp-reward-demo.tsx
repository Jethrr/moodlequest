"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XPRewardPopup } from "@/components/ui/xp-reward-popup";
import { Zap, Gift, Trophy, Star } from "lucide-react";

export function XPRewardDemo() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [demoScenario, setDemoScenario] = useState(1);

  // Demo scenarios
  const scenarios = {
    1: {
      xpEarned: 10,
      taskTitle: "Completed Daily Login Quest",
      currentXP: 40,
      previousXP: 30,
      currentLevel: 1,
      xpToNextLevel: 60,
      maxXP: 100,
    },
    2: {
      xpEarned: 25,
      taskTitle: "Submitted Assignment - Advanced React",
      currentXP: 95,
      previousXP: 70,
      currentLevel: 1,
      xpToNextLevel: 5,
      maxXP: 100,
    },
    3: {
      xpEarned: 30,
      taskTitle: "Perfect Quiz Score!",
      currentXP: 130,
      previousXP: 100,
      currentLevel: 2,
      xpToNextLevel: 70,
      maxXP: 100,
    },
  };

  const handleTriggerPopup = (scenario: number) => {
    setDemoScenario(scenario);
    setIsPopupOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Zap className="h-5 w-5" />
            XP Reward Popup Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-sm">
            Test the XP reward popup with different scenarios. Each scenario demonstrates different XP amounts and level-up conditions.
          </p>
          
          <div className="grid gap-3 sm:grid-cols-3">
            {/* Scenario 1: Normal XP Gain */}
            <Button
              onClick={() => handleTriggerPopup(1)}
              className="flex flex-col items-center gap-2 h-auto p-4 bg-green-500 hover:bg-green-600 text-white"
            >
              <Gift className="h-5 w-5" />
              <div className="text-center">
                <div className="font-semibold">Small Reward</div>
                <div className="text-xs opacity-90">+10 XP (No Level Up)</div>
              </div>
            </Button>

            {/* Scenario 2: Almost Level Up */}
            <Button
              onClick={() => handleTriggerPopup(2)}
              className="flex flex-col items-center gap-2 h-auto p-4 bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Star className="h-5 w-5" />
              <div className="text-center">
                <div className="font-semibold">Big Reward</div>
                <div className="text-xs opacity-90">+25 XP (Almost Level Up)</div>
              </div>
            </Button>

            {/* Scenario 3: Level Up */}
            <Button
              onClick={() => handleTriggerPopup(3)}
              className="flex flex-col items-center gap-2 h-auto p-4 bg-purple-500 hover:bg-purple-600 text-white"
            >
              <Trophy className="h-5 w-5" />
              <div className="text-center">
                <div className="font-semibold">Epic Reward</div>
                <div className="text-xs opacity-90">+30 XP (Level Up!)</div>
              </div>
            </Button>
          </div>

          <div className="pt-4 border-t border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">Current Scenario Details:</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div>XP Earned: <span className="font-medium">+{scenarios[demoScenario as keyof typeof scenarios].xpEarned} XP</span></div>
              <div>Previous XP: <span className="font-medium">{scenarios[demoScenario as keyof typeof scenarios].previousXP}/{scenarios[demoScenario as keyof typeof scenarios].maxXP}</span></div>
              <div>New XP: <span className="font-medium">{scenarios[demoScenario as keyof typeof scenarios].currentXP}/{scenarios[demoScenario as keyof typeof scenarios].maxXP}</span></div>
              <div>Level: <span className="font-medium">{scenarios[demoScenario as keyof typeof scenarios].currentLevel}</span></div>
            </div>
          </div>
        </CardContent>
      </Card>      {/* XP Reward Popup */}
      <XPRewardPopup
        isOpen={isPopupOpen}
        onCloseAction={() => setIsPopupOpen(false)}
        {...scenarios[demoScenario as keyof typeof scenarios]}
      />
    </div>
  );
}
