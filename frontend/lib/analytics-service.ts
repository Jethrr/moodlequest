import { apiClient } from "./api-client";

export interface EngagementData {
  day: string;
  activeUsers: number;
  badgesEarned: number;
  questsCompleted: number;
}

export interface EngagementSummary {
  totalActiveUsers: number;
  totalBadgesEarned: number;
  totalQuestsCompleted: number;
  timeRange: string;
  courseId?: number;
}

export interface AnalyticsResponse<T> {
  success: boolean;
  data: T;
  timeRange: string;
  courseId?: number;
}

export class AnalyticsService {
  static async getEngagementAnalytics(
    timeRange: "week" | "month" | "semester" = "week",
    courseId?: number
  ): Promise<EngagementData[]> {
    try {
      const params = new URLSearchParams({
        time_range: timeRange,
        ...(courseId && { course_id: courseId.toString() }),
      });

      const response = await apiClient.request<
        AnalyticsResponse<EngagementData[]>
      >(`/analytics/engagement?${params}`);

      if (response.success) {
        return response.data;
      } else {
        throw new Error("Failed to fetch engagement analytics");
      }
    } catch (error) {
      console.error("Error fetching engagement analytics:", error);
      throw error;
    }
  }

  static async getEngagementSummary(
    timeRange: "week" | "month" | "semester" = "week",
    courseId?: number
  ): Promise<EngagementSummary> {
    try {
      const params = new URLSearchParams({
        time_range: timeRange,
        ...(courseId && { course_id: courseId.toString() }),
      });

      const response = await apiClient.request<
        AnalyticsResponse<EngagementSummary>
      >(`/analytics/summary?${params}`);

      if (response.success) {
        return response.data;
      } else {
        throw new Error("Failed to fetch engagement summary");
      }
    } catch (error) {
      console.error("Error fetching engagement summary:", error);
      throw error;
    }
  }
}
