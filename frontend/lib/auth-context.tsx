"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { apiClient, MoodleLoginResult } from "./api-client"

export type User = {
  id: string
  token: string
  username: string
  name: string
  email: string
  role: string
  moodleId: string
  avatarUrl?: string
  level?: number
  xp?: number
  badges?: number
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<MoodleLoginResult>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Mark component as mounted on client-side
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Check for existing session on component mount
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        if (typeof window !== 'undefined') {
          const storedUser = localStorage.getItem("moodlequest_user")
          if (storedUser) {
            const userData = JSON.parse(storedUser)
            // Set the token in the API client
            apiClient.setToken(userData.token)
            
            // Use the stored user data directly
            setUser(userData)
          }
        }
      } catch (error) {
        console.error("Error loading user from storage:", error)
        localStorage.removeItem("moodlequest_user")
      } finally {
        setIsLoading(false)
      }
    }

    if (isMounted) {
      loadUserFromStorage()
    }
  }, [isMounted])

  // Update token in API client whenever user changes
  useEffect(() => {
    if (user?.token) {
      apiClient.setToken(user.token)
    } else {
      apiClient.setToken('')
    }
  }, [user])

  // Redirect unauthenticated users away from protected routes
  useEffect(() => {
    if (!isLoading && isMounted) {
      const publicRoutes = ["/signin", "/register", "/"]
      const isPublicRoute = publicRoutes.includes(pathname || "")
      
      if (!user && !isPublicRoute) {
        router.push("/signin")
      }
    }
  }, [user, isLoading, isMounted, pathname, router])

  const login = async (username: string, password: string) => {
    try {
      const result = await apiClient.login(username, password)
      
      if (result.success && result.user) {
        // Ensure we have a complete user object with all required fields
        const userData: User = {
          id: result.user.id || "",
          token: result.token || result.access_token || "",
          username: result.user.username || username,
          name: result.user.name || result.user.username || username,
          email: result.user.email || "",
          role: result.user.role || "student",
          moodleId: result.user.moodleId || result.user.id || "",
          avatarUrl: result.user.avatarUrl || "",
          level: result.user.level,
          xp: result.user.xp,
          badges: result.user.badges
        }
        
        setUser(userData)
        localStorage.setItem("moodlequest_user", JSON.stringify(userData))
      }
      
      return result
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const logout = () => {
    apiClient.logout().catch(error => {
      console.error("Error during logout:", error)
    })
    
    setUser(null)
    localStorage.removeItem("moodlequest_user")
    router.push("/signin")
  }

  // Only provide the real context value after mounting on client
  const contextValue = isMounted 
    ? { user, isLoading, login, logout }
    : { user: null, isLoading: true, login, logout }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function useRequireAuth() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  useEffect(() => {
    if (isMounted && !isLoading && !user) {
      router.push("/signin")
    }
  }, [user, isLoading, isMounted, router])
  
  return { user, isLoading }
} 