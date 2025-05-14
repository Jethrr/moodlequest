import type { UserRole } from "@/lib/moodle-auth"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  moodleId: string
  avatarUrl?: string
  level?: number
  xp?: number
  badges?: number
}

export interface Role {
  id: string
  name: string
  permissions: string[]
}

export interface AuthResult {
  success: boolean
  user?: User
  error?: string
  requiresMfa?: boolean
  mfaChallenge?: {
    challengeId: string
    method: string
  }
}

export interface MFAVerificationResult {
  success: boolean
  error?: string
}
