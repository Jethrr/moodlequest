import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import type { BadgeSystemResponse, UserBadge, Badge } from "@/types/badges";
import { toast } from "@/hooks/use-toast";

export interface UseBadgesReturn {
  badgeSystem: BadgeSystemResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  checkAndAwardBadges: () => Promise<UserBadge[]>;
}

export function useBadges(userId?: number): UseBadgesReturn {
  const [badgeSystem, setBadgeSystem] = useState<BadgeSystemResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBadgeSystem = async () => {
    try {
      setLoading(true);
      setError(null);

      let response: BadgeSystemResponse;
      if (userId) {
        response = await apiClient.getUserBadgeSystem(userId);
      } else {
        response = await apiClient.getMyBadgeSystem();
      }

      setBadgeSystem(response);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch badges";
      setError(errorMessage);
      console.error("Error fetching badge system:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkAndAwardBadges = async (): Promise<UserBadge[]> => {
    try {
      let newBadges: UserBadge[];
      if (userId) {
        newBadges = await apiClient.checkAndAwardBadges(userId);
      } else {
        // If no userId provided, we can't check badges without knowing which user
        throw new Error("User ID required for checking badges");
      }

      // Show toast for new badges
      if (newBadges.length > 0) {
        const badgeNames = newBadges.map((ub) => ub.badge.name).join(", ");
        toast({
          title: `🎉 New Badge${newBadges.length > 1 ? "s" : ""} Earned!`,
          description: `You've earned: ${badgeNames}`,
        });

        // Refetch badge system to get updated data
        await fetchBadgeSystem();
      }

      return newBadges;
    } catch (err) {
      console.error("Error checking badges:", err);
      toast({
        title: "Error",
        description: "Failed to check for new badges",
        variant: "destructive",
      });
      return [];
    }
  };

  const refetch = async () => {
    await fetchBadgeSystem();
  };

  useEffect(() => {
    fetchBadgeSystem();
  }, [userId]);

  return {
    badgeSystem,
    loading,
    error,
    refetch,
    checkAndAwardBadges,
  };
}

export interface UseAllBadgesReturn {
  badges: Badge[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAllBadges(activeOnly: boolean = true): UseAllBadgesReturn {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getAllBadges(activeOnly);
      setBadges(response);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch badges";
      setError(errorMessage);
      console.error("Error fetching badges:", err);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchBadges();
  };

  useEffect(() => {
    fetchBadges();
  }, [activeOnly]);

  return {
    badges,
    loading,
    error,
    refetch,
  };
}

export interface UseUserBadgesReturn {
  userBadges: UserBadge[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useUserBadges(userId?: number): UseUserBadgesReturn {
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserBadges = async () => {
    try {
      setLoading(true);
      setError(null);

      let response: UserBadge[];
      if (userId) {
        response = await apiClient.getUserBadges(userId);
      } else {
        response = await apiClient.getMyBadges();
      }

      setUserBadges(response);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch user badges";
      setError(errorMessage);
      console.error("Error fetching user badges:", err);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchUserBadges();
  };

  useEffect(() => {
    fetchUserBadges();
  }, [userId]);

  return {
    userBadges,
    loading,
    error,
    refetch,
  };
}
