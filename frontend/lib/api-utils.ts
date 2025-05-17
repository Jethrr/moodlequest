/**
 * Utility functions for API interactions with Moodle
 */

export interface MoodleApiError {
  error: string;
  errorcode?: string;
  stacktrace?: string;
}

export interface MoodleTokenResponse {
  token?: string;
  error?: string;
  errorcode?: string;
}

/**
 * Make a request to the Moodle API
 */
export async function moodleApiRequest<T>(
  endpoint: string, 
  params: Record<string, string> = {},
  token?: string
): Promise<T> {
  // Build the query string from params
  const queryParams = new URLSearchParams(params).toString();
  const url = `${endpoint}${queryParams ? '?' + queryParams : ''}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Add the token to headers if provided
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, {
      headers,
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check for Moodle API error format
    if (data.error) {
      throw {
        error: data.error,
        errorcode: data.errorcode,
        stacktrace: data.stacktrace
      };
    }
    
    return data as T;
  } catch (error) {
    console.error('Moodle API request failed:', error);
    throw error;
  }
}

/**
 * Get a token from Moodle using username and password
 */
export async function getMoodleToken(
  username: string, 
  password: string, 
  service: string = 'modquest'
): Promise<string> {
  try {
    const endpoint = 'https://moodle/login/token.php';
    const params = {
      username: encodeURIComponent(username),
      password: encodeURIComponent(password),
      service
    };
    
    const data = await moodleApiRequest<MoodleTokenResponse>(endpoint, params);
    
    if (!data.token) {
      throw new Error(data.error || 'No token returned');
    }
    
    return data.token;
  } catch (error) {
    console.error('Failed to get Moodle token:', error);
    throw error;
  }
}

/**
 * Format error messages from various error types
 */
export function formatApiError(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object') {
    // Handle Moodle API error format
    if ('error' in error && typeof error.error === 'string') {
      return error.error;
    }
    
    // Handle standard Error object
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
  }
  
  return 'An unknown error occurred';
} 