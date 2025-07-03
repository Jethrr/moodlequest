"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useBadgeChecker } from "@/hooks/use-badge-checker";
import { Award, CheckCircle, Clock, Zap, Trophy, User } from "lucide-react";

export function BadgeCheckerPanel() {
  const [userId, setUserId] = useState<number>(1);
  const [badgeId, setBadgeId] = useState<number>(1);
  const [eventType, setEventType] = useState<string>("quest_completed");
  const [checkResult, setCheckResult] = useState<any>(null);
  const [specificBadgeResult, setSpecificBadgeResult] = useState<any>(null);

  const {
    checkAllBadges,
    triggerEventBasedCheck,
    checkSpecificBadge,
    onQuestCompleted,
    onUserLogin,
    onXpEarned,
    onDailyQuestCompleted,
    isChecking,
    lastCheckResult,
  } = useBadgeChecker();

  const handleCheckAllBadges = async () => {
    try {
      const result = await checkAllBadges(userId);
      setCheckResult(result);
    } catch (error) {
      console.error("Failed to check badges:", error);
    }
  };

  const handleTriggerEvent = async () => {
    try {
      const result = await triggerEventBasedCheck({
        user_id: userId,
        event_type: eventType as any,
        course_id: 1,
      });
      setCheckResult(result);
    } catch (error) {
      console.error("Failed to trigger event:", error);
    }
  };

  const handleCheckSpecificBadge = async () => {
    try {
      const result = await checkSpecificBadge(userId, badgeId);
      setSpecificBadgeResult(result);
    } catch (error) {
      console.error("Failed to check specific badge:", error);
    }
  };

  const handleQuickEvent = async (eventType: string) => {
    try {
      let result;
      switch (eventType) {
        case "quest":
          result = await onQuestCompleted(userId, 1, 1);
          break;
        case "login":
          result = await onUserLogin(userId);
          break;
        case "xp":
          result = await onXpEarned(userId, 100, 1);
          break;
        case "daily":
          result = await onDailyQuestCompleted(userId, 1);
          break;
        default:
          return;
      }
      setCheckResult(result);
    } catch (error) {
      console.error("Failed to trigger quick event:", error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Badge Checker Panel
          </CardTitle>
          <CardDescription>
            Test badge criteria checking and awarding functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Selection */}
          <div className="space-y-2">
            <Label htmlFor="userId">User ID</Label>
            <Input
              id="userId"
              type="number"
              value={userId}
              onChange={(e) => setUserId(parseInt(e.target.value) || 1)}
              placeholder="Enter user ID"
            />
          </div>

          {/* Quick Event Buttons */}
          <div className="space-y-3">
            <Label>Quick Event Triggers</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => handleQuickEvent("quest")}
                disabled={isChecking}
                className="flex items-center gap-2"
              >
                <Trophy className="h-4 w-4" />
                Quest Completed
              </Button>
              <Button
                variant="outline"
                onClick={() => handleQuickEvent("login")}
                disabled={isChecking}
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                User Login
              </Button>
              <Button
                variant="outline"
                onClick={() => handleQuickEvent("xp")}
                disabled={isChecking}
                className="flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                XP Earned (+100)
              </Button>
              <Button
                variant="outline"
                onClick={() => handleQuickEvent("daily")}
                disabled={isChecking}
                className="flex items-center gap-2"
              >
                <Clock className="h-4 w-4" />
                Daily Quest
              </Button>
            </div>
          </div>

          {/* Custom Event Trigger */}
          <div className="space-y-3">
            <Label>Custom Event Trigger</Label>
            <div className="flex gap-2">
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quest_completed">
                    Quest Completed
                  </SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="xp_earned">XP Earned</SelectItem>
                  <SelectItem value="daily_quest_completed">
                    Daily Quest Completed
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleTriggerEvent} disabled={isChecking}>
                Trigger Event
              </Button>
            </div>
          </div>

          {/* Check All Badges */}
          <Button
            onClick={handleCheckAllBadges}
            disabled={isChecking}
            className="w-full"
          >
            {isChecking ? "Checking..." : "Check All Badges"}
          </Button>

          {/* Check Specific Badge */}
          <div className="space-y-3">
            <Label>Check Specific Badge</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={badgeId}
                onChange={(e) => setBadgeId(parseInt(e.target.value) || 1)}
                placeholder="Badge ID"
              />
              <Button onClick={handleCheckSpecificBadge} disabled={isChecking}>
                Check Badge
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {(checkResult || lastCheckResult) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Check Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">User ID:</span>
                <Badge variant="secondary">
                  {(checkResult || lastCheckResult)?.user_id || userId}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Newly Awarded:</span>
                <Badge
                  variant={
                    ((checkResult || lastCheckResult)?.newly_awarded || 0) > 0
                      ? "default"
                      : "secondary"
                  }
                >
                  {(checkResult || lastCheckResult)?.newly_awarded || 0} badges
                </Badge>
              </div>
              {((checkResult || lastCheckResult)?.badges || []).length > 0 && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">Awarded Badges:</span>
                  <div className="space-y-1">
                    {((checkResult || lastCheckResult)?.badges || []).map(
                      (badge: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-green-50 rounded-lg"
                        >
                          <span className="text-sm">{badge.name}</span>
                          <Badge variant="outline">+{badge.exp_bonus} XP</Badge>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Specific Badge Results */}
      {specificBadgeResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-500" />
              Specific Badge Check
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Badge:</span>
                <Badge variant="secondary">
                  {specificBadgeResult.badge_name}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Meets Criteria:</span>
                <Badge
                  variant={
                    specificBadgeResult.meets_criteria
                      ? "default"
                      : "destructive"
                  }
                >
                  {specificBadgeResult.meets_criteria ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progress:</span>
                <Badge variant="outline">
                  {specificBadgeResult.progress?.current || 0} /{" "}
                  {specificBadgeResult.progress?.target || 1}(
                  {specificBadgeResult.progress?.percentage?.toFixed(1) || 0}%)
                </Badge>
              </div>
              {specificBadgeResult.criteria && (
                <div className="space-y-1">
                  <span className="text-sm font-medium">Criteria:</span>
                  <div className="text-xs text-muted-foreground p-2 bg-gray-50 rounded">
                    <pre>
                      {JSON.stringify(specificBadgeResult.criteria, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
