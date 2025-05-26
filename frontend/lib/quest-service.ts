import { apiClient } from "./api-client";

export async function createQuest(questData: any) {
  try {
    // POST to /quests/create-quest (relative to API base)
    const response = await apiClient.request(
      "/quests/create-quest",
      "POST",
      questData
    );
    return response;
  } catch (error: any) {
    throw error;
  }
}
