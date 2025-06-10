/**
 * API client for interacting with the FastAPI backend
 */

import { User } from "./auth-context";

// Update to match your actual backend URL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002/api";

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
}

export const apiClient = new ApiClient();

export default apiClient;
