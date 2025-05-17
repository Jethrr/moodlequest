import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, Quest, QuestCreate } from "@/lib/api-client";

// Query key for quests
const QUESTS_KEY = "quests";

// Dummy quests for development/demo when the API is not available
const DUMMY_QUESTS: Quest[] = [
  {
    quest_id: 1,
    title: "Complete JavaScript Basics",
    description: "Finish the JavaScript fundamentals module and submit all exercises",
    course_id: 2,
    creator_id: 1,
    exp_reward: 100,
    quest_type: "assignment",
    validation_method: "manual",
    validation_criteria: { min_score: 70 },
    start_date: null,
    end_date: null,
    is_active: true,
    difficulty_level: 1,
    created_at: new Date().toISOString(),
    last_updated: new Date().toISOString()
  },
  {
    quest_id: 2,
    title: "Build a React App",
    description: "Create a simple todo application using React hooks",
    course_id: 2,
    creator_id: 1,
    exp_reward: 250,
    quest_type: "project",
    validation_method: "manual",
    validation_criteria: { required_features: ["CRUD operations", "Filtering", "Persistence"] },
    start_date: null,
    end_date: null,
    is_active: true,
    difficulty_level: 3,
    created_at: new Date().toISOString(),
    last_updated: new Date().toISOString()
  },
  {
    quest_id: 3,
    title: "Data Structures Quiz",
    description: "Complete the online quiz about basic data structures",
    course_id: 3,
    creator_id: 1,
    exp_reward: 75,
    quest_type: "quiz",
    validation_method: "automatic",
    validation_criteria: { passing_score: 80 },
    start_date: null,
    end_date: null,
    is_active: true,
    difficulty_level: 2,
    created_at: new Date().toISOString(),
    last_updated: new Date().toISOString()
  }
];

// Hook to fetch all quests
export function useQuests(filters?: { course_id?: number; is_active?: boolean }) {
  return useQuery({
    queryKey: [QUESTS_KEY, filters],
    queryFn: async () => {
      try {
        return await apiClient.getQuests(filters);
      } catch (error) {
        console.error("Failed to fetch quests from API, using dummy data", error);
        
        // Filter dummy quests based on the provided filters
        let filteredQuests = [...DUMMY_QUESTS];
        
        if (filters?.course_id !== undefined) {
          filteredQuests = filteredQuests.filter(quest => quest.course_id === filters.course_id);
        }
        
        if (filters?.is_active !== undefined) {
          filteredQuests = filteredQuests.filter(quest => quest.is_active === filters.is_active);
        }
        
        return filteredQuests;
      }
    },
  });
}

// Hook to fetch a single quest
export function useQuest(questId: number) {
  return useQuery({
    queryKey: [QUESTS_KEY, questId],
    queryFn: async () => {
      try {
        return await apiClient.getQuest(questId);
      } catch (error) {
        console.error(`Failed to fetch quest ${questId} from API, using dummy data`, error);
        // Find the dummy quest with matching ID
        const dummyQuest = DUMMY_QUESTS.find(q => q.quest_id === questId);
        if (!dummyQuest) throw new Error(`Quest with ID ${questId} not found`);
        return dummyQuest;
      }
    },
    enabled: !!questId,
  });
}

// Hook to create a new quest
export function useCreateQuest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ quest, creatorId }: { quest: QuestCreate; creatorId: number }) => {
      try {
        return await apiClient.createQuest(quest, creatorId);
      } catch (error) {
        console.error("Failed to create quest via API, using dummy creation", error);
        // Create a mock new quest with a unique ID
        const newId = Math.max(0, ...DUMMY_QUESTS.map(q => q.quest_id)) + 1;
        const newQuest: Quest = {
          quest_id: newId,
          title: quest.title,
          description: quest.description || null,
          course_id: quest.course_id || null,
          creator_id: creatorId,
          exp_reward: quest.exp_reward,
          quest_type: quest.quest_type,
          validation_method: quest.validation_method,
          validation_criteria: quest.validation_criteria || null,
          start_date: quest.start_date || null,
          end_date: quest.end_date || null,
          is_active: quest.is_active !== undefined ? quest.is_active : true,
          difficulty_level: quest.difficulty_level || 1,
          created_at: new Date().toISOString(),
          last_updated: new Date().toISOString()
        };
        
        // Add to local dummy quests
        DUMMY_QUESTS.push(newQuest);
        return newQuest;
      }
    },
    onSuccess: () => {
      // Invalidate quests queries to refetch data
      queryClient.invalidateQueries({ queryKey: [QUESTS_KEY] });
    },
  });
}

// Hook to update a quest
export function useUpdateQuest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ questId, quest }: { questId: number; quest: Partial<QuestCreate> }) => {
      try {
        return await apiClient.updateQuest(questId, quest);
      } catch (error) {
        console.error(`Failed to update quest ${questId} via API, using dummy update`, error);
        // Find the quest in dummy data
        const questIndex = DUMMY_QUESTS.findIndex(q => q.quest_id === questId);
        if (questIndex === -1) throw new Error(`Quest with ID ${questId} not found`);
        
        // Update the dummy quest
        const updatedQuest = {
          ...DUMMY_QUESTS[questIndex],
          ...quest,
          last_updated: new Date().toISOString()
        };
        
        DUMMY_QUESTS[questIndex] = updatedQuest;
        return updatedQuest;
      }
    },
    onSuccess: (updatedQuest) => {
      // Update the cache for the individual quest
      queryClient.setQueryData([QUESTS_KEY, updatedQuest.quest_id], updatedQuest);
      
      // Invalidate the quests list
      queryClient.invalidateQueries({ queryKey: [QUESTS_KEY] });
    },
  });
}

// Hook to delete a quest
export function useDeleteQuest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (questId: number) => {
      try {
        await apiClient.deleteQuest(questId);
      } catch (error) {
        console.error(`Failed to delete quest ${questId} via API, using dummy delete`, error);
        // Find the quest in dummy data
        const questIndex = DUMMY_QUESTS.findIndex(q => q.quest_id === questId);
        if (questIndex === -1) throw new Error(`Quest with ID ${questId} not found`);
        
        // Remove from dummy quests
        DUMMY_QUESTS.splice(questIndex, 1);
      }
      return questId;
    },
    onSuccess: (questId) => {
      // Remove the quest from cache
      queryClient.removeQueries({ queryKey: [QUESTS_KEY, questId] });
      
      // Invalidate the quests list
      queryClient.invalidateQueries({ queryKey: [QUESTS_KEY] });
    },
  });
} 