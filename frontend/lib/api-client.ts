/**
 * API client for interacting with the FastAPI backend
 */

import { User } from "./auth-context";
import type {
  Badge,
  UserBadge,
  BadgeSystemResponse,
  BadgeCreate,
  BadgeUpdate,
  BadgeCheckResult,
} from "@/types/badges";

// Update to match your actual backend URL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL;

export interface ApiErrorResponse {
  success: false;
  error: string;
  status?: number;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface MoodleLoginParams {
  username: string;
  password: string;
  service?: string;
}

export interface MoodleLoginResult {
  success: boolean;
  user?: any;
  token?: string;
  access_token?: string;
  privateToken?: string;
  error?: string;
}

export interface JwtToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  user: {
    id: number;
    username: string;
    email?: string;
    role: string;
  };
}

// Daily Quest Types
export interface DailyQuest {
  quest_id: number;
  quest_type: string;
  title: string;
  description: string;
  xp_reward: number;
}

export interface UserDailyQuest {
  id: number;
  user_id: number;
  daily_quest_id: number;
  quest_date: string;
  status: "available" | "completed" | "expired";
  current_progress: number;
  target_progress: number;
  started_at?: string;
  completed_at?: string;
  expires_at: string;
  xp_awarded: number;
  quest_metadata: any;
  daily_quest: DailyQuest;
}

export interface DailyQuestSummary {
  date: string;
  total_quests: number;
  completed_quests: number;
  completion_percentage: number;
  total_xp_earned: number;
  quests: UserDailyQuest[];
}

export interface QuestCompletionResponse {
  success: boolean;
  message: string;
  xp_awarded: number;
  quest?: UserDailyQuest;
}

// Teacher Profile Types
export interface TeacherProfile {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  email: string;
  profile_image_url?: string;
  bio?: string;
  joined_date: string;
  total_courses: number;
  active_courses: number;
  total_students: number;
  quests_created: number;
  badges_designed: number;
  account_status: string;
}

export interface TeacherProfileUpdate {
  first_name?: string;
  last_name?: string;
  bio?: string;
  profile_image_url?: string;
}

// Streak Types
export interface UserStreak {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  start_date?: string;
  streak_type: string;
}

export interface StreakResponse {
  success: boolean;
  streak: UserStreak;
}

export interface StudentProgress {
  user_id: number;
  total_exp: number;
  quests_completed: number;
  badges_earned: number;
  study_hours: number;
  streak_days: number;
  last_activity: string | null;
}

class ApiClient {
  private token: string = "";
  private connectionPoolTimers: Map<string, NodeJS.Timeout> = new Map();
  private maxRetries: number = 2;

  setToken(token: string) {
    this.token = token;
  }

  getToken() {
    return this.token;
  }

  // Helper for making API requests with automatic retries and connection pooling
  public async request<T>(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    body?: any,
    retries: number = this.maxRetries,
    timeout: number = 8000
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    // Check if we have a connection in progress to this endpoint
    const poolKey = `${method}:${url}`;
    if (this.connectionPoolTimers.has(poolKey)) {
      // We're already trying to connect to this endpoint, wait a bit before retrying
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    // Create an abort controller for the timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Mark this connection as in progress
    this.connectionPoolTimers.set(poolKey, timeoutId);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
        credentials: "include", // This ensures cookies are sent with the request
      });

      // Connection completed, remove from pool
      clearTimeout(timeoutId);
      this.connectionPoolTimers.delete(poolKey);

      // Handle HTTP error responses
      if (!response.ok) {
        const errorText = await response.text();

        // For database connection errors, retry
        if (
          (errorText.includes("SSL SYSCALL error") ||
            errorText.includes("EOF detected") ||
            errorText.includes("connection") ||
            response.status >= 500) &&
          retries > 0
        ) {
          console.warn(
            `Database connection issue, retrying... (${retries} attempts left)`
          );
          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return this.request<T>(endpoint, method, body, retries - 1);
        }

        throw new Error(
          `API Error ${response.status}: ${errorText || response.statusText}`
        );
      }

      // Handle 204 No Content responses (like DELETE operations)
      if (response.status === 204) {
        return undefined as T;
      }

      // Check if response has content before trying to parse as JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        return undefined as T;
      }

      return (await response.json()) as T;
    } catch (error) {
      // Connection error or timeout, clean up
      clearTimeout(timeoutId);
      this.connectionPoolTimers.delete(poolKey);

      // Handle abort/timeout errors
      if (error instanceof DOMException && error.name === "AbortError") {
        if (retries > 0) {
          console.warn(
            `Request timeout, retrying... (${retries} attempts left)`
          );
          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return this.request<T>(endpoint, method, body, retries - 1);
        }
        throw new Error("Request timeout");
      }

      throw error;
    }
  }

  // Moodle login
  async login(username: string, password: string): Promise<MoodleLoginResult> {
    try {
      return await this.request<MoodleLoginResult>(
        "/auth/moodle/login",
        "POST",
        {
          username,
          password,
        }
      );
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Login failed",
      };
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await this.request<void>("/auth/logout", "POST");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear token regardless of API response
      this.token = "";
    }
  }
  // Store user data with retry and resilience
  async storeUser(userData: any): Promise<any> {
    try {
      return await this.request<any>(
        "/auth/moodle/store-user",
        "POST",
        userData
      );
    } catch (error) {
      console.warn("User storage error (non-critical):", error);
      // Return a mock success response as this should be non-blocking
      return { success: true, message: "User data will sync later" };
    }
  } // Fetch student progress data
  async fetchStudentProgress(userId: number): Promise<StudentProgress> {
    try {
      return await this.request<StudentProgress>(
        `/quests/student-progress/${userId}`,
        "GET"
      );
    } catch (error) {
      console.error("Student progress fetch error:", error);
      throw error;
    }
  }

  // Daily Quest Methods
  async getDailyQuestSummary(userId: number): Promise<DailyQuestSummary> {
    try {
      return await this.request<DailyQuestSummary>(
        `/daily-quests/user/${userId}`,
        "GET"
      );
    } catch (error) {
      console.error("Daily quest summary fetch error:", error);
      throw error;
    }
  }

  async completeDailyQuest(
    userId: number,
    questType: string
  ): Promise<QuestCompletionResponse> {
    try {
      return await this.request<QuestCompletionResponse>(
        `/daily-quests/user/${userId}/complete`,
        "POST",
        { quest_type: questType }
      );
    } catch (error) {
      console.error("Daily quest completion error:", error);
      throw error;
    }
  }

  async seedDailyQuests(): Promise<any> {
    try {
      return await this.request<any>("/daily-quests/seed", "POST");
    } catch (error) {
      console.error("Daily quest seed error:", error);
      throw error;
    }
  }

  // Streak Methods
  async getUserStreak(
    userId: number,
    streakType: string = "daily_login"
  ): Promise<StreakResponse> {
    try {
      return await this.request<StreakResponse>(
        `/daily-quests/user/${userId}/streak?streak_type=${streakType}`,
        "GET"
      );
    } catch (error) {
      console.error("User streak fetch error:", error);
      throw error;
    }
  }

  // Profile Methods
  async getTeacherProfile(): Promise<TeacherProfile> {
    try {
      return await this.request<TeacherProfile>("/profile/teacher", "GET");
    } catch (error) {
      console.error("Teacher profile fetch error:", error);
      throw error;
    }
  }

  async updateTeacherProfile(
    updateData: TeacherProfileUpdate
  ): Promise<TeacherProfile> {
    try {
      return await this.request<TeacherProfile>(
        "/profile/teacher",
        "PUT",
        updateData
      );
    } catch (error) {
      console.error("Teacher profile update error:", error);
      throw error;
    }
  }

  // Convenience methods for specific quest types
  async completeDailyLoginQuest(
    userId: number
  ): Promise<QuestCompletionResponse> {
    return this.completeDailyQuest(userId, "daily_login");
  }

  async completeFeedPetQuest(userId: number): Promise<QuestCompletionResponse> {
    return this.completeDailyQuest(userId, "feed_pet");
  }

  async completeEarnXPQuest(
    userId: number,
    xpAmount: number = 10
  ): Promise<QuestCompletionResponse> {
    try {
      return await this.request<QuestCompletionResponse>(
        `/daily-quests/user/${userId}/complete`,
        "POST",
        { quest_type: "earn_xp", xp_amount: xpAmount }
      );
    } catch (error) {
      console.error("Earn XP quest completion error:", error);
      throw error;
    }
  }
  // Badge Methods
  async getAllBadges(activeOnly: boolean = true): Promise<Badge[]> {
    try {
      // Use longer timeout for badges endpoint as it might be slower
      return await this.request<Badge[]>(
        `/badges?active_only=${activeOnly}`,
        "GET",
        undefined,
        3, // More retries for badges
        15000 // Longer timeout (15 seconds)
      );
    } catch (error) {
      console.error("Get all badges error:", error);
      throw error;
    }
  }

  async getBadge(badgeId: number): Promise<Badge> {
    try {
      return await this.request<Badge>(`/badges/${badgeId}`, "GET");
    } catch (error) {
      console.error("Get badge error:", error);
      throw error;
    }
  }

  async createBadge(badgeData: BadgeCreate): Promise<Badge> {
    try {
      return await this.request<Badge>("/badges", "POST", badgeData);
    } catch (error) {
      console.error("Create badge error:", error);
      throw error;
    }
  }

  async seedBadges(): Promise<{ message: string }> {
    try {
      return await this.request<{ message: string }>("/badges/seed", "POST");
    } catch (error) {
      console.error("Seed badges error:", error);
      throw error;
    }
  }

  async updateBadge(badgeId: number, badgeData: BadgeUpdate): Promise<Badge> {
    try {
      return await this.request<Badge>(`/badges/${badgeId}`, "PUT", badgeData);
    } catch (error) {
      console.error("Update badge error:", error);
      throw error;
    }
  }
  async getUserBadges(userId: number): Promise<UserBadge[]> {
    try {
      return await this.request<UserBadge[]>(`/badges/user/${userId}`, "GET");
    } catch (error) {
      console.error("Get user badges error:", error);
      throw error;
    }
  }

  async getUserBadgeSystem(userId: number): Promise<BadgeSystemResponse> {
    try {
      return await this.request<BadgeSystemResponse>(
        `/badges/user/${userId}/system`,
        "GET"
      );
    } catch (error) {
      console.error("Get user badge system error:", error);
      throw error;
    }
  }
  async getUserBadgeProgress(userId: number): Promise<{
    earned_badges: any[];
    available_badges: any[];
    stats: {
      total_badges: number;
      earned_count: number;
      available_count: number;
      completion_percentage: number;
    };
  }> {
    try {
      return await this.request(`/badges/user/${userId}/progress`, "GET");
    } catch (error) {
      console.error("Get user badge progress error:", error);
      throw error;
    }
  }

  async getMyBadgeSystem(): Promise<BadgeSystemResponse> {
    try {
      return await this.request<BadgeSystemResponse>(
        "/badges/me/system",
        "GET"
      );
    } catch (error) {
      console.error("Get my badge system error:", error);
      throw error;
    }
  }

  async getMyBadges(): Promise<UserBadge[]> {
    try {
      return await this.request<UserBadge[]>("/badges/me/earned", "GET");
    } catch (error) {
      console.error("Get my badges error:", error);
      throw error;
    }
  }

  async awardBadge(userId: number, badgeId: number): Promise<UserBadge> {
    try {
      return await this.request<UserBadge>(
        `/badges/user/${userId}/award/${badgeId}`,
        "POST"
      );
    } catch (error) {
      console.error("Award badge error:", error);
      throw error;
    }
  }

  async checkAndAwardBadges(userId: number): Promise<UserBadge[]> {
    try {
      return await this.request<UserBadge[]>(
        `/badges/user/${userId}/check`,
        "POST"
      );
    } catch (error) {
      console.error("Check and award badges error:", error);
      throw error;
    }
  }

  // Badge Checking Methods
  async checkAllBadgesForUser(
    userId: number,
    courseId?: number,
    awardedBy?: number
  ): Promise<BadgeCheckResult> {
    try {
      const url = `/badges/check-all/${userId}${
        courseId ? `?course_id=${courseId}` : ""
      }${awardedBy ? `&awarded_by=${awardedBy}` : ""}`;
      return await this.request<BadgeCheckResult>(url, "POST");
    } catch (error) {
      console.error("Check all badges error:", error);
      throw error;
    }
  }

  async triggerBadgeCheck(eventData: {
    user_id: number;
    event_type:
      | "quest_completed"
      | "login"
      | "xp_earned"
      | "daily_quest_completed";
    course_id?: number;
    metadata?: any;
  }): Promise<BadgeCheckResult> {
    try {
      return await this.request<BadgeCheckResult>(
        "/badges/trigger-check",
        "POST",
        eventData
      );
    } catch (error) {
      console.error("Trigger badge check error:", error);
      throw error;
    }
  }

  async checkSpecificBadgeCriteria(
    userId: number,
    badgeId: number
  ): Promise<{
    badge_id: number;
    badge_name: string;
    user_id: number;
    meets_criteria: boolean;
    progress: any;
    criteria: any;
  }> {
    try {
      return await this.request(
        `/badges/check-criteria/${userId}/${badgeId}`,
        "GET"
      );
    } catch (error) {
      console.error("Check specific badge criteria error:", error);
      throw error;
    }
  }

  // Quest Methods
  async createQuest(questData: any, creatorId: number): Promise<any> {
    try {
      return await this.request<any>(
        `/quests?creator_id=${creatorId}`,
        "POST",
        questData
      );
    } catch (error) {
      console.error("Create quest error:", error);
      throw error;
    }
  }

  async getQuests(filters?: {
    skip?: number;
    limit?: number;
    course_id?: number;
    is_active?: boolean;
    difficulty_level?: number;
  }): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, value.toString());
          }
        });
      }
      const url = `/quests${params.toString() ? `?${params.toString()}` : ''}`;
      return await this.request<any>(url, "GET");
    } catch (error) {
      console.error("Get quests error:", error);
      throw error;
    }
  }

  async getQuest(questId: number): Promise<any> {
    try {
      return await this.request<any>(`/quests/${questId}`, "GET");
    } catch (error) {
      console.error("Get quest error:", error);
      throw error;
    }
  }

  async updateQuest(questId: number, questData: any): Promise<any> {
    try {
      return await this.request<any>(`/quests/${questId}`, "PUT", questData);
    } catch (error) {
      console.error("Update quest error:", error);
      throw error;
    }
  }

  async deleteQuest(questId: number): Promise<void> {
    try {
      await this.request<void>(`/quests/${questId}`, "DELETE");
    } catch (error) {
      console.error("Delete quest error:", error);
      throw error;
    }
  }

  async getMyQuests(): Promise<any> {
    try {
      return await this.request<any>("/quests/my-quests", "GET");
    } catch (error) {
      console.error("Get my quests error:", error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient();

export default apiClient;
