import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";

export interface WeeklyDataPoint {
  day: string;
  exp_reward: number;
  quests_completed: number;
}

export interface MonthlyDataPoint {
  week: string;
  exp_reward: number;
  quests_completed: number;
}

export interface StreakDay {
  date: string;
  intensity: number;
  dayOfWeek: number;
}

export interface ProgressOverviewResponse {
  success: boolean;
  message: string;
  weekly_data: WeeklyDataPoint[];
  monthly_data: MonthlyDataPoint[];
  streak_data: StreakDay[];
}

export interface DetailedProgressResponse extends ProgressOverviewResponse {
  recent_activities: any[];
  badges_earned: any[];
}

export function useProgress() {
  const [progressData, setProgressData] =
    useState<ProgressOverviewResponse | null>(null);
  const [detailedProgressData, setDetailedProgressData] =
    useState<DetailedProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgressOverview = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.request("/progress/overview");
      setProgressData(response as ProgressOverviewResponse);
    } catch (err) {
      console.error("Error fetching progress overview:", err);
      setError("Failed to load progress data");
    } finally {
      setLoading(false);
    }
  };

  const fetchDetailedProgress = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.request("/progress/detailed");
      setDetailedProgressData(response as DetailedProgressResponse);
    } catch (err) {
      console.error("Error fetching detailed progress:", err);
      setError("Failed to load detailed progress data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgressOverview();
  }, []);

  return {
    progressData,
    detailedProgressData,
    loading,
    error,
    refetch: fetchProgressOverview,
    fetchDetailed: fetchDetailedProgress,
  };
}
