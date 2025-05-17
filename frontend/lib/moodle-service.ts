import { moodleApiRequest, MoodleTokenResponse } from '@/lib/api-utils';

export interface MoodleUser {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  roles?: string[];
  // Add more fields as needed
}

export interface MoodleCourse {
  id: number;
  shortname: string;
  fullname: string;
  summary?: string;
  categoryid?: number;
  // Add more fields as needed
}

/**
 * Service class for Moodle API interactions
 */
export class MoodleService {
  private baseUrl: string;
  private token: string | null;
  
  constructor(baseUrl = 'https://moodle', token: string | null = null) {
    this.baseUrl = baseUrl;
    this.token = token;
  }
  
  /**
   * Set the authentication token
   */
  setToken(token: string) {
    this.token = token;
  }
  
  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<MoodleUser> {
    if (!this.token) {
      throw new Error('Authentication token required');
    }
    
    const endpoint = `${this.baseUrl}/webservice/rest/server.php`;
    const params = {
      wstoken: this.token,
      wsfunction: 'core_user_get_users_by_field',
      moodlewsrestformat: 'json',
      field: 'current',
      values: '1'
    };
    
    const response = await moodleApiRequest<{users: MoodleUser[]}>(endpoint, params);
    
    if (!response.users || response.users.length === 0) {
      throw new Error('No user data returned');
    }
    
    return response.users[0];
  }
  
  /**
   * Get courses for the current user
   */
  async getUserCourses(): Promise<MoodleCourse[]> {
    if (!this.token) {
      throw new Error('Authentication token required');
    }
    
    const endpoint = `${this.baseUrl}/webservice/rest/server.php`;
    const params = {
      wstoken: this.token,
      wsfunction: 'core_enrol_get_users_courses',
      moodlewsrestformat: 'json',
      userid: '1' // This should be the actual user ID
    };
    
    return moodleApiRequest<MoodleCourse[]>(endpoint, params);
  }
  
  /**
   * Get course content
   */
  async getCourseContent(courseId: number): Promise<any> {
    if (!this.token) {
      throw new Error('Authentication token required');
    }
    
    const endpoint = `${this.baseUrl}/webservice/rest/server.php`;
    const params = {
      wstoken: this.token,
      wsfunction: 'core_course_get_contents',
      moodlewsrestformat: 'json',
      courseid: courseId.toString()
    };
    
    return moodleApiRequest<any>(endpoint, params);
  }
  
  /**
   * Get quizzes for a course
   */
  async getCourseQuizzes(courseId: number): Promise<any> {
    if (!this.token) {
      throw new Error('Authentication token required');
    }
    
    const endpoint = `${this.baseUrl}/webservice/rest/server.php`;
    const params = {
      wstoken: this.token,
      wsfunction: 'mod_quiz_get_quizzes_by_courses',
      moodlewsrestformat: 'json',
      courseids: courseId.toString()
    };
    
    return moodleApiRequest<any>(endpoint, params);
  }
} 