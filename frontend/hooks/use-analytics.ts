import { useState, useEffect } from "react";
import {
  AnalyticsService,
  EngagementData,
  EngagementSummary,
  PerformanceData,
  EngagementInsightsData,
} from "@/lib/analytics-service";

export interface UseAnalyticsOptions {
  timeRange?: "week" | "month" | "semester";
  courseId?: number;
  autoFetch?: boolean;
}

export interface UseAnalyticsReturn {
  engagementData: EngagementData[];
  summary: EngagementSummary | null;
  performanceData: PerformanceData[];
  engagementInsights: EngagementInsightsData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setTimeRange: (range: "week" | "month" | "semester") => void;
  setCourseId: (id: number | undefined) => void;
}

export function useAnalytics(
  options: UseAnalyticsOptions = {}
): UseAnalyticsReturn {
  const { timeRange = "week", courseId, autoFetch = true } = options;

  const [engagementData, setEngagementData] = useState<EngagementData[]>([]);
  const [summary, setSummary] = useState<EngagementSummary | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [engagementInsights, setEngagementInsights] = useState<EngagementInsightsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTimeRange, setCurrentTimeRange] = useState(timeRange);
  const [currentCourseId, setCurrentCourseId] = useState(courseId);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch engagement data, summary, performance data, and engagement insights in parallel
      const [engagementResponse, summaryResponse, performanceResponse, insightsResponse] = await Promise.all([
        AnalyticsService.getEngagementAnalytics(
          currentTimeRange,
          currentCourseId
        ),
        AnalyticsService.getEngagementSummary(
          currentTimeRange,
          currentCourseId
        ),
        AnalyticsService.getPerformanceAnalytics(
          currentTimeRange,
          currentCourseId
        ),
        AnalyticsService.getEngagementInsights(
          currentTimeRange,
          currentCourseId
        ),
      ]);

      setEngagementData(engagementResponse);
      setSummary(summaryResponse);
      setPerformanceData(performanceResponse);
      setEngagementInsights(insightsResponse);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch analytics data";
      setError(errorMessage);
      console.error("Analytics fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [currentTimeRange, currentCourseId, autoFetch]);

  const refetch = async () => {
    await fetchData();
  };

  const setTimeRange = (range: "week" | "month" | "semester") => {
    setCurrentTimeRange(range);
  };

  const setCourseId = (id: number | undefined) => {
    setCurrentCourseId(id);
  };

  return {
    engagementData,
    summary,
    performanceData,
    engagementInsights,
    loading,
    error,
    refetch,
    setTimeRange,
    setCourseId,
  };
}
