export interface Quest {
  id: string
  title: string
  description: string
  xp: number
  progress: number
  difficulty: "Easy" | "Medium" | "Hard" | "Epic"
  category: string
  deadline: string
  status: "not-started" | "in-progress" | "completed"
  createdBy?: string
  learningObjectives?: string[]
  requirements?: string[]
  rewards?: Reward[]
  tasks?: Task[]
}

export interface Task {
  id: string
  description: string
  completed: boolean
  xpReward: number
}

export interface Reward {
  type: "xp" | "badge" | "item" | "pet-accessory" | "currency"
  value: number
  name: string
  description?: string
  iconUrl?: string
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: string
  earnedDate?: string
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary"
  progress?: number
}

export interface VirtualPet {
  id: string
  name: string
  species: string
  level: number
  happiness: number
  energy: number
  lastFed: string
  lastPlayed: string
  accessories: PetAccessory[]
  iconUrl: string
}

export interface PetAccessory {
  id: string
  name: string
  description: string
  slot: "background" | "left" | "bottom-left" | "bottom-right"
  iconUrl: string
  position?: {
    position?: string
    top?: string
    left?: string
    right?: string
    bottom?: string
    transform?: string
    opacity?: string
    zIndex?: string
    fontSize?: string
    display?: string
    alignItems?: string
    justifyContent?: string
    inset?: string
    width?: string
    height?: string
  }
  stats?: {
    happinessBoost?: number
    energyBoost?: number
    xpBoost?: number
  }
}

export interface UserProgress {
  userId: string
  level: number
  xp: number
  totalQuestsCompleted: number
  questsInProgress: number
  badges: number
  streakDays: number
  lastActive: string
  subjectProgress: {
    [subject: string]: {
      progress: number
      total: number
      completed: number
    }
  }
}
