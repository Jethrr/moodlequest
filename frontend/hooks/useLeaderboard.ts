import { useState, useEffect, useCallback } from 'react';
import { leaderboardService } from '@/lib/leaderboard-service';
import { LeaderboardUser, TimeFrameOption, MetricType } from '@/types/gamification';

export interface UseLeaderboardOptions {
  courseId?: number;
  initialTimeframe?: TimeFrameOption;
  initialMetricType?: MetricType;
  autoFetch?: boolean;
}

export interface LeaderboardData {
  topUsers: LeaderboardUser[];
  otherUsers: LeaderboardUser[];
  totalParticipants: number;
}

export interface UseLeaderboardReturn {
  data: LeaderboardData;
  loading: boolean;
  error: string | null;
  timeframe: TimeFrameOption;
  metricType: MetricType;
  searchQuery: string;
  searchResults: LeaderboardUser[];
  searchLoading: boolean;
  setTimeframe: (timeframe: TimeFrameOption) => void;
  setMetricType: (metricType: MetricType) => void;
  setSearchQuery: (query: string) => void;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

export function useLeaderboard(options: UseLeaderboardOptions = {}): UseLeaderboardReturn {
  const {
    courseId,
    initialTimeframe = 'weekly',
    initialMetricType = 'exp',
    autoFetch = true
  } = options;

  // State
  const [data, setData] = useState<LeaderboardData>({
    topUsers: [],
    otherUsers: [],
    totalParticipants: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<TimeFrameOption>(initialTimeframe);
  const [metricType, setMetricType] = useState<MetricType>(initialMetricType);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LeaderboardUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentLimit, setCurrentLimit] = useState(50);

  // Fetch leaderboard data
  const fetchLeaderboardData = useCallback(async (limit: number = 50) => {
    setLoading(true);
    setError(null);

    try {
      const result = await leaderboardService.getFormattedLeaderboardData(
        courseId,
        timeframe,
        metricType,
        limit
      );
      
      setData(result);
      setHasMore(result.totalParticipants > limit);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch leaderboard data';
      setError(errorMessage);
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  }, [courseId, timeframe, metricType]);

  // Search functionality
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const results = await leaderboardService.searchLeaderboardUsers(
        query,
        courseId,
        timeframe,
        20
      );
      setSearchResults(results);
    } catch (err) {
      console.error('Error searching leaderboard:', err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, [courseId, timeframe]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, performSearch]);

  // Update timeframe
  const handleTimeframeChange = useCallback((newTimeframe: TimeFrameOption) => {
    setTimeframe(newTimeframe);
    setCurrentLimit(50); // Reset limit when changing timeframe
  }, []);

  // Update metric type
  const handleMetricTypeChange = useCallback((newMetricType: MetricType) => {
    setMetricType(newMetricType);
    setCurrentLimit(50); // Reset limit when changing metric type
  }, []);

  // Refresh data
  const refresh = useCallback(async () => {
    await fetchLeaderboardData(currentLimit);
  }, [fetchLeaderboardData, currentLimit]);

  // Load more data
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    
    const newLimit = currentLimit + 20;
    setCurrentLimit(newLimit);
    await fetchLeaderboardData(newLimit);
  }, [hasMore, loading, currentLimit, fetchLeaderboardData]);

  // Clear search when query is empty
  const handleSearchQueryChange = useCallback((query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    if (autoFetch) {
      fetchLeaderboardData(currentLimit);
    }
  }, [fetchLeaderboardData, currentLimit, autoFetch]);

  return {
    data,
    loading,
    error,
    timeframe,
    metricType,
    searchQuery,
    searchResults,
    searchLoading,
    setTimeframe: handleTimeframeChange,
    setMetricType: handleMetricTypeChange,
    setSearchQuery: handleSearchQueryChange,
    refresh,
    loadMore,
    hasMore
  };
} 