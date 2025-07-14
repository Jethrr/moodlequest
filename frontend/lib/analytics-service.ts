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

export interface PerformanceData {
  day: string;
  averageXp: number;
  completionRate: number;
  totalAttempts: number;
  completedQuests: number;
}

export interface EngagementInsightsData {
  loginPatterns: LoginPattern[];
  activityHeatmap: Record<string, Record<number, number>>;
  engagementLevels: EngagementLevels;
  streakAnalysis: StreakAnalysis;
  timePeriods: TimePeriod[];
  actionDistribution: ActionDistribution[];
}

export interface LoginPattern {
  hour: number;
  uniqueUsers: number;
}

export interface EngagementLevels {
  high: number;
  medium: number;
  low: number;
}

export interface StreakAnalysis {
  currentStreak: number;
  maxStreak: number;
  totalDays: number;
  activeDays: number;
  consistencyRate: number;
}

export interface TimePeriod {
  period: string;
  activityCount: number;
}

export interface ActionDistribution {
  action: string;
  count: number;
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

  static async getPerformanceAnalytics(
    timeRange: "week" | "month" | "semester" = "week",
    courseId?: number
  ): Promise<PerformanceData[]> {
    try {
      const params = new URLSearchParams({
        time_range: timeRange,
        ...(courseId && { course_id: courseId.toString() }),
      });

      const response = await apiClient.request<
        AnalyticsResponse<PerformanceData[]>
      >(`/analytics/performance?${params}`);

      if (response.success) {
        return response.data;
      } else {
        throw new Error("Failed to fetch performance analytics");
      }
    } catch (error) {
      console.error("Error fetching performance analytics:", error);
      throw error;
    }
  }

  static async getEngagementInsights(
    timeRange: "week" | "month" | "semester" = "week",
    courseId?: number
  ): Promise<EngagementInsightsData> {
    try {
      const params = new URLSearchParams({
        time_range: timeRange,
        ...(courseId && { course_id: courseId.toString() }),
      });

      const response = await apiClient.request<
        AnalyticsResponse<EngagementInsightsData>
      >(`/analytics/engagement-insights?${params}`);

      if (response.success) {
        return response.data;
      } else {
        throw new Error("Failed to fetch engagement insights");
      }
    } catch (error) {
      console.error("Error fetching engagement insights:", error);
      throw error;
    }
  }
}
