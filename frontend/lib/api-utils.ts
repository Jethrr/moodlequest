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
  privatetoken?: string;
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
  const queryParams = new URLSearchParams();
  
  // Add all params to the query string
  Object.entries(params).forEach(([key, value]) => {
    queryParams.append(key, value);
  });
  
  const url = `${endpoint}${endpoint.includes('?') ? '&' : '?'}${queryParams.toString()}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Add the token to headers if provided
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    console.log(`Fetching: ${url}`);
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
): Promise<MoodleTokenResponse> {
  try {
    console.log('Getting Moodle token via proxy');
    
    // Use our server-side proxy to avoid CORS and DNS issues
    const response = await fetch('/api/proxy/moodle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: 'login/token.php',
        params: {
          username,
          password,
          service
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.token) {
      throw new Error(data.error || 'No token returned');
    }
    
    return data;
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

/**
 * Get user information from Moodle by field
 * @param token The Moodle API token
 * @param field The field to search by (e.g., 'username', 'id', 'email')
 * @param value The value to search for
 * @returns User information
 */
export async function getMoodleUserByField(
  token: string,
  field: string = 'username',
  value: string
): Promise<any> {
  try {
    console.log('Getting Moodle user info via proxy');
    
    // Use our server-side proxy to avoid CORS and DNS issues
    const response = await fetch('/api/proxy/moodle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: 'webservice/rest/server.php',
        params: {
          wstoken: token,
          wsfunction: 'core_user_get_users_by_field',
          moodlewsrestformat: 'json',
          field,
          'values[0]': value
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (Array.isArray(data) && data.length > 0) {
      return {
        success: true,
        user: data[0]
      };
    } else if (data.exception) {
      return {
        success: false,
        error: data.message || 'Error retrieving user information'
      };
    } else {
      return {
        success: false,
        error: 'No user found with the specified criteria'
      };
    }
  } catch (error) {
    console.error('Failed to get Moodle user information:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
} 