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

  /**
   * Make a request to the API
   * @param endpoint The API endpoint to call
   * @param options Additional fetch options
   * @returns The API response
   */
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    
    // Merge provided headers with defaults
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {}),
      ...(options.headers || {})
    };
    
    try {
      const response = await fetch(url, {
        ...options,
        headers
      });
      
      if (!response.ok) {
        // Try to parse error response
        try {
          const errorData = await response.json();
          return {
            success: false,
            error: errorData.error || errorData.message || `HTTP error: ${response.status}`,
            status: response.status
          };
        } catch (parseError) {
          return {
            success: false,
            error: `HTTP error: ${response.status} ${response.statusText}`,
            status: response.status
          };
        }
      }
      
      const data = await response.json();
      return { success: true, ...data };
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
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


