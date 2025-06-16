"use client";

import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { LevelInfo } from "@/lib/leveling-system";

interface UserLevelDisplayProps {
  levelInfo: LevelInfo;
  loading?: boolean;
}

export function UserLevelDisplay({ levelInfo, loading = false }: UserLevelDisplayProps) {
  if (loading) {
    return (
      <div className="bg-card rounded-xl border shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-2 bg-gray-200 rounded mb-4"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border shadow-sm p-6"
    >
      <div className="space-y-4">
        {/* Level and Title */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">Level {levelInfo.level}</h3>
            <Badge 
              variant="outline"
              className={`${levelInfo.color} border-current`}
            >
              {levelInfo.title}
            </Badge>
          </div>
          <div className={`text-3xl ${levelInfo.glowColor} drop-shadow-lg`}>
            {/* Use the theme icon or a default star */}
            ⭐
          </div>
        </div>

        {/* XP Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">XP Progress</span>
            <span className="font-medium">
              {levelInfo.xpProgress.toLocaleString()} / {levelInfo.xpForNextLevel.toLocaleString()}
            </span>
          </div>
          
          <Progress 
            value={levelInfo.xpProgressPercentage} 
            className="h-3"
          />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Level {levelInfo.level}</span>
            <span>{Math.round(levelInfo.xpProgressPercentage)}% to next level</span>
            <span>Level {levelInfo.level + 1}</span>
          </div>
        </div>

        {/* Total XP */}
        <div className="pt-2 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total XP</span>
            <span className="font-bold text-lg">
              {levelInfo.currentXP.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
