/**
 * API client for interacting with the FastAPI backend
 */

import { User } from "./auth-context"

// Update to match your actual backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

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
  user?: User;
  token?: string;
  access_token?: string;
  refresh_token?: string;
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

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
    console.log('API client initialized with base URL:', this.baseUrl);
  }

  setToken(token: string) {
    this.token = token;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...options.headers,
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    return response.json()
  }

  async login(username: string, password: string): Promise<MoodleLoginResult> {
    try {
      const response = await this.request<MoodleLoginResult>("/auth/moodle/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      })

      if (response.success && response.token) {
        this.setToken(response.token)
      }

      return response
    } catch (error) {
      console.error("Login error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }

  async logout(): Promise<void> {
    try {
      await this.request("/auth/logout", { method: "POST" })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      this.token = null
    }
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

export default apiClient; 


