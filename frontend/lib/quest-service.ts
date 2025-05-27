import { apiClient } from "./api-client";

export interface QuestCreationResponse {
  success: boolean;
  quest_id?: number;
  message?: string;
  error?: string;
}

export async function createQuest(
  questData: any
): Promise<QuestCreationResponse> {
  try {
    // POST to /quests/create-quest (relative to API base)
    const response = await apiClient.request<QuestCreationResponse>(
      "/quests/create-quest",
      "POST",
      questData
    );
    return response;
  } catch (error: any) {
    // If the error has a response property, it's from the API
    if (error.response) {
      return {
        success: false,
        error: error.response.data?.error || error.message,
      };
    }
    // Otherwise it's a network error
    return {
      success: false,
      error: error.message || "Network error while creating quest",
    };
  }
}
