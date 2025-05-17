/**
 * API client for interacting with the FastAPI backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api';

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
  token?: string;
  user?: {
    id: number;
    username: string;
    email?: string;
    role: string;
    first_name?: string;
    last_name?: string;
    is_active: boolean;
    created_at: string;
  };
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
  private token: string | null;

  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.token = null;
  }

  setToken(token: string) {
    this.token = token;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.detail || errorData.error || response.statusText,
          status: response.status,
        };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Authentication methods
  async moodleLogin(params: MoodleLoginParams): Promise<ApiResponse<MoodleLoginResult>> {
    return this.request<MoodleLoginResult>('/auth/moodle/login', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getUserInfo(): Promise<ApiResponse<any>> {
    return this.request<any>('/auth/me');
  }

  async logout(): Promise<ApiResponse<any>> {
    return this.request<any>('/auth/logout', { method: 'POST' });
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

export default apiClient; 


