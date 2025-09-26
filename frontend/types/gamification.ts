export interface Quests {
  id: string;
  title: string;
  description: string;
  xp: number;
  progress: number;
  difficulty: "Easy" | "Medium" | "Hard" | "Epic";
  category: string;
  deadline: string;
  status: "not-started" | "in-progress" | "completed";
  createdBy?: string;
  learningObjectives?: string[];
  requirements?: string[];
  rewards?: Reward[];
}


export interface Reward {
  type: "xp" | "badge" | "item" | "pet-accessory" | "currency";
  value: number;
  name: string;
  description?: string;
  iconUrl?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  earnedDate?: string;
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
  progress?: number;
}

export interface VirtualPet {
  id: string;
  name: string;
  species: string;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  happiness: number;
  energy: number;
  lastFed: string;
  lastPlayed: string;
  accessories: PetAccessory[];
  iconUrl: string;
}

export interface PetAccessory {
  id: string;
  name: string;
  description: string;
  slot: "background" | "left" | "bottom-left" | "bottom-right";
  iconUrl: string;
  levelRequired: number;
  position?: {
    position?: string;
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
    transform?: string;
    opacity?: string;
    zIndex?: string;
    fontSize?: string;
    display?: string;
    alignItems?: string;
    justifyContent?: string;
    inset?: string;
    width?: string;
    height?: string;
  };
  stats?: {
    happinessBoost?: number;
    energyBoost?: number;
    xpBoost?: number;
  };
}

export interface AvailableAccessory {
  accessory_id: number;
  name: string;
  description: string;
  accessory_type: string;
  icon_url: string;
  level_required: number;
  stats_boost: any;
  unlocked: boolean;
}

export interface UserProgress {
  userId: string;
  level: number;
  xp: number;
  totalQuestsCompleted: number;
  questsInProgress: number;
  badges: number;
  streakDays: number;
  lastActive: string;
  subjectProgress: {
    [subject: string]: {
      progress: number;
      total: number;
      completed: number;
    };
  };
}

// Leaderboard Types
export interface LeaderboardEntry {
  entry_id: number;
  leaderboard_id: number;
  user_id: number;
  score: number;
  rank: number;
  last_updated: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  profile_image_url?: string;
}

export interface Leaderboard {
  leaderboard_id: number;
  name: string;
  description?: string;
  course_id?: number;
  metric_type:
    | "exp"
    | "quests_completed"
    | "badges_earned"
    | "engagement_score";
  timeframe: "daily" | "weekly" | "monthly" | "all_time";
  is_active: boolean;
  created_at: string;
  last_updated: string;
  entries: LeaderboardEntry[];
}

export interface TopStudent {
  user_id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  profile_image_url?: string;
  score: number;
  rank: number;
  total_exp?: number;
  quests_completed?: number;
  badges_earned?: number;
}

export interface LeaderboardSummary {
  leaderboard_id: number;
  name: string;
  metric_type: string;
  timeframe: string;
  total_participants: number;
  top_score?: number;
  last_updated: string;
}

export interface CourseLeaderboard {
  course_id: number;
  course_name: string;
  leaderboards: LeaderboardSummary[];
  top_students: TopStudent[];
}

export interface StudentProgress {
  progress_id: number;
  user_id: number;
  course_id: number;
  total_exp: number;
  quests_completed: number;
  badges_earned: number;
  engagement_score?: number;
  study_hours?: number;
  last_activity?: string;
  streak_days?: number;
  last_updated: string;
  username?: string;
  first_name?: string;
  last_name?: string;
}

export interface LeaderboardFilter {
  course_id?: number;
  metric_type?: string;
  timeframe?: string;
  is_active?: boolean;
  limit?: number;
  offset?: number;
}

// Frontend-specific leaderboard types
export interface LeaderboardUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  profile_image_url: string | null;
  rank: string;
  stats: {
    badges_count: number;
    badges_earned: number;
    quests_completed: number;
    exp_points: number;
    rank_score: number;
  };
  level: number;
  position?: number; // Actual rank position in leaderboard
}

export type TimeFrameOption = "daily" | "weekly" | "monthly" | "all_time";
export type MetricType =
  | "exp"
  | "quests_completed"
  | "badges_earned"
  | "engagement_score";
