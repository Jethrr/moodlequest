import { apiClient } from "./api-client";

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

export class ProgressService {
  /**
   * Get comprehensive progress overview for the current user
   */
  static async getProgressOverview(): Promise<ProgressOverviewResponse> {
    try {
      const response = await apiClient.request<ProgressOverviewResponse>(
        "/progress/overview"
      );
      return response;
    } catch (error) {
      console.error("Error fetching progress overview:", error);
      throw error;
    }
  }

  /**
   * Get detailed progress data including recent activities and badges
   */
  static async getDetailedProgress(): Promise<DetailedProgressResponse> {
    try {
      const response = await apiClient.request<DetailedProgressResponse>(
        "/progress/detailed"
      );
      return response;
    } catch (error) {
      console.error("Error fetching detailed progress:", error);
      throw error;
    }
  }

  /**
   * Get progress overview for a specific user (for teachers/professors)
   */
  static async getProgressOverviewByUserId(
    userId: number
  ): Promise<ProgressOverviewResponse> {
    try {
      const response = await apiClient.request<ProgressOverviewResponse>(
        `/progress/overview/${userId}`
      );
      return response;
    } catch (error) {
      console.error("Error fetching progress overview for user:", error);
      throw error;
    }
  }
}
