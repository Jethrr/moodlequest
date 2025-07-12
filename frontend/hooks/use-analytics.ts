import { useState, useEffect } from "react";
import {
  AnalyticsService,
  EngagementData,
  EngagementSummary,
} from "@/lib/analytics-service";

export interface UseAnalyticsOptions {
  timeRange?: "week" | "month" | "semester";
  courseId?: number;
  autoFetch?: boolean;
}

export interface UseAnalyticsReturn {
  engagementData: EngagementData[];
  summary: EngagementSummary | null;
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTimeRange, setCurrentTimeRange] = useState(timeRange);
  const [currentCourseId, setCurrentCourseId] = useState(courseId);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch both engagement data and summary in parallel
      const [engagementResponse, summaryResponse] = await Promise.all([
        AnalyticsService.getEngagementAnalytics(
          currentTimeRange,
          currentCourseId
        ),
        AnalyticsService.getEngagementSummary(
          currentTimeRange,
          currentCourseId
        ),
      ]);

      setEngagementData(engagementResponse);
      setSummary(summaryResponse);
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
    loading,
    error,
    refetch,
    setTimeRange,
    setCourseId,
  };
}
