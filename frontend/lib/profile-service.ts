import { apiClient } from '@/lib/api-client';
import { User } from '@/lib/auth-context';

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// Profile cache store
interface ProfileCache {
  data: ProfileData;
  timestamp: number;
}
const profileCache: Map<string, ProfileCache> = new Map();

export interface MoodleProfileData {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  profileimageurl?: string;
  department?: string;
  institution?: string;
  roles?: any[];
}

export interface ProfileData {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_image_url: string;
  role: string;
  level: number;
  learning_score: number;
  joined_date: string;
  school: string;
  department: string;
  stats: {
    finished_skills: number;
    watched_workflows: number;
    viewed_time: string;
    courses_completed: number;
    quests_completed: number;
    exp_points: number;
  };
  badges_collected: any[];
  certificates: any[];
  ranking: {
    position: number;
    total_students: number;
  };
}

/**
 * Fetch user profile data from backend and Moodle
 * @param user Current authenticated user
 * @returns Combined profile data
 */
export async function fetchUserProfile(user: User): Promise<ProfileData | null> {
  if (!user) return null;
  
  // Check cache first
  const cacheKey = `profile-${user.id}`;
  const cached = profileCache.get(cacheKey);
  
  // If we have a valid cached profile, return it
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('Using cached profile data');
    return cached.data;
  }
  
  try {
    let profileData: ProfileData | null = null;
    
    // First try to fetch extended profile data from our backend
    try {
      const profileResult = await apiClient.request<any>(
        `/users/${user.id}/profile?username=${encodeURIComponent(user.username)}`,
        {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        }
      );
      
      if (profileResult.success) {
        profileData = {
          ...profileResult.data,
          id: user.id,
          username: user.username,
          role: user.role,
        };
      }
    } catch (backendError) {
      console.warn("Backend profile fetch failed:", backendError);
      // Continue to try other methods
    }
    
    // If backend fetch failed, try to fetch data from Moodle directly
    if (!profileData && user.token) {
      try {
        // Fetch additional Moodle profile data
        const moodleData = await fetchMoodleProfile(user.token, user.username);
        
        // Store this data in our backend for future use
        try {
          await storeMoodleProfile(moodleData, user.token);
        } catch (storeError) {
          console.warn("Failed to store Moodle profile:", storeError);
          // Non-blocking, continue with local data
        }
        
        // Create profile data from Moodle response
        profileData = createProfileFromMoodle(moodleData, user);
      } catch (moodleError) {
        console.warn("Error fetching Moodle profile:", moodleError);
        // Continue to fallback
      }
    }
    
    // If both attempts fail, create basic profile from session data
    if (!profileData) {
      profileData = createDefaultProfile(user);
    }
    
    // Cache the result
    profileCache.set(cacheKey, {
      data: profileData,
      timestamp: Date.now()
    });
    
    return profileData;
  } catch (error) {
    console.error("Error fetching profile data:", error);
    // Always return something to avoid UI errors
    const fallbackProfile = createDefaultProfile(user);
    return fallbackProfile;
  }
}

/**
 * Fetch detailed user profile from Moodle
 */
async function fetchMoodleProfile(token: string, username: string): Promise<MoodleProfileData> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
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
          field: 'username',
          'values[0]': username
        }
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Moodle profile: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    }
    
    throw new Error('No user profile found in Moodle');
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Moodle profile fetch timeout');
    }
    throw error;
  }
}

/**
 * Store Moodle profile data in our backend
 */
async function storeMoodleProfile(moodleData: MoodleProfileData, token: string): Promise<void> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    await fetch('/api/auth/moodle/store-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        moodleId: moodleData.id,
        username: moodleData.username,
        email: moodleData.email || `${moodleData.username}@example.com`,
        firstName: moodleData.firstname || '',
        lastName: moodleData.lastname || '',
        token: token,
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
  } catch (error) {
    console.error('Failed to store Moodle profile in backend:', error);
    // Non-blocking error - we continue even if storage fails
    throw error;
  }
}

/**
 * Create profile data from Moodle user data
 */
function createProfileFromMoodle(moodleData: MoodleProfileData, user: User): ProfileData {
  return {
    id: user.id,
    username: moodleData.username || user.username,
    first_name: moodleData.firstname || user.username.split('.')[0] || '',
    last_name: moodleData.lastname || user.username.split('.')[1] || '',
    email: moodleData.email || user.email || `${user.username}@example.com`,
    profile_image_url: moodleData.profileimageurl || user.avatarUrl || "/avatars/placeholder.jpg",
    role: user.role,
    level: user.level || 1,
    learning_score: 3,
    joined_date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    school: moodleData.institution || "Unknown School",
    department: moodleData.department || "General Studies",
    badges_collected: [],
    stats: {
      finished_skills: 0,
      watched_workflows: 0,
      viewed_time: "0min",
      courses_completed: 0,
      quests_completed: 0,
      exp_points: user.xp || 0
    },
    certificates: [],
    ranking: {
      position: 0,
      total_students: 0
    }
  };
}

/**
 * Create default profile data from session
 */
function createDefaultProfile(user: User): ProfileData {
  return {
    id: user.id,
    username: user.username,
    first_name: user.username.split('.')[0] || '',
    last_name: user.username.split('.')[1] || '',
    email: user.email || `${user.username}@example.com`,
    profile_image_url: user.avatarUrl || "/avatars/placeholder.jpg",
    role: user.role,
    level: user.level || 1,
    learning_score: 3,
    joined_date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    school: "Unknown School",
    department: "General Studies",
    badges_collected: [],
    stats: {
      finished_skills: 0,
      watched_workflows: 0,
      viewed_time: "0min",
      courses_completed: 0,
      quests_completed: 0,
      exp_points: user.xp || 0
    },
    certificates: [],
    ranking: {
      position: 0,
      total_students: 0
    }
  };
} 