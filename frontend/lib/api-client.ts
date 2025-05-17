// Define the base API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002';

// Type for Quest
export interface Quest {
  quest_id: number;
  title: string;
  description: string | null;
  course_id: number | null;
  creator_id: number;
  exp_reward: number;
  quest_type: string;
  validation_method: string;
  validation_criteria: Record<string, any> | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  difficulty_level: number;
  created_at: string;
  last_updated: string;
}

// Type for creating a quest
export interface QuestCreate {
  title: string;
  description?: string;
  course_id?: number;
  exp_reward: number;
  quest_type: string;
  validation_method: string;
  validation_criteria?: Record<string, any>;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
  difficulty_level?: number;
}

// Helper to handle API responses with improved error handling
async function fetchWithErrorHandling<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || `API error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error(`API request failed: ${url}`, error);
    throw error;
  }
}

// API functions
export const apiClient = {
  // Fetch all quests
  async getQuests(filters?: { course_id?: number; is_active?: boolean }): Promise<Quest[]> {
    const queryParams = new URLSearchParams();
    
    if (filters?.course_id) {
      queryParams.append('course_id', filters.course_id.toString());
    }
    
    if (filters?.is_active !== undefined) {
      queryParams.append('is_active', filters.is_active.toString());
    }
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    return fetchWithErrorHandling<Quest[]>(`${API_BASE_URL}/quests${queryString}`);
  },
  
  // Fetch a single quest by ID
  async getQuest(questId: number): Promise<Quest> {
    return fetchWithErrorHandling<Quest>(`${API_BASE_URL}/quests/${questId}`);
  },
  
  // Create a new quest
  async createQuest(quest: QuestCreate, creatorId: number): Promise<Quest> {
    return fetchWithErrorHandling<Quest>(`${API_BASE_URL}/quests?creator_id=${creatorId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quest),
    });
  },
  
  // Update an existing quest
  async updateQuest(questId: number, quest: Partial<QuestCreate>): Promise<Quest> {
    return fetchWithErrorHandling<Quest>(`${API_BASE_URL}/quests/${questId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quest),
    });
  },
  
  // Delete a quest
  async deleteQuest(questId: number): Promise<void> {
    await fetchWithErrorHandling<void>(`${API_BASE_URL}/quests/${questId}`, {
      method: 'DELETE',
    });
  },
  
  // Create dummy data for testing
  async createDummyData(): Promise<{ message: string; data: { quests: number; courses: number; users: number } }> {
    return fetchWithErrorHandling(`${API_BASE_URL}/quests/dummy-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
  
  // Create a single dummy quest
  async createSingleDummy(): Promise<{ message: string; quest_id: number }> {
    return fetchWithErrorHandling(`${API_BASE_URL}/quests/single-dummy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
}; 