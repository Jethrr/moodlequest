"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { apiClient, MoodleLoginResult } from "./api-client"

type User = {
  id: string
  token: string
  username: string
  role?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Check for existing session on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem("moodlequest_user")
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          // Set the token in the API client
          apiClient.setToken(userData.token)

          // You could verify the token is still valid here with a server call
          const userInfoResult = await apiClient.getUserInfo()
          if (userInfoResult.success) {
            setUser(userData)
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem("moodlequest_user")
          }
        }
      } catch (error) {
        console.error("Error checking authentication:", error)
        localStorage.removeItem("moodlequest_user")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Redirect unauthenticated users away from protected routes
  useEffect(() => {
    if (!isLoading) {
      const publicRoutes = ["/signin", "/register", "/"]
      const isPublicRoute = publicRoutes.includes(pathname || "")
      
      if (!user && !isPublicRoute) {
        router.push("/signin")
      }
    }
  }, [user, isLoading, pathname, router])

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    try {
      // Call the FastAPI backend for authentication
      const result = await apiClient.moodleLogin({ username, password })
      
      if (result.success && result.data.success && result.data.token) {
        const userData: User = {
          id: String(result.data.user?.id || ""),
          token: result.data.token,
          username: result.data.user?.username || username,
          role: result.data.user?.role || "student"
        }
        
        localStorage.setItem("moodlequest_user", JSON.stringify(userData))
        setUser(userData)
        apiClient.setToken(result.data.token)
        return { success: true }
      } else {
        return { 
          success: false, 
          error: result.success ? result.data.error : result.error 
        }
      }
    } catch (error) {
      console.error("Login error:", error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      // Call the API to logout
      await apiClient.logout()
    } catch (error) {
      console.error("Error during logout:", error)
    } finally {
      // Even if API call fails, remove user from local storage
      localStorage.removeItem("moodlequest_user")
      setUser(null)
      router.push("/signin")
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout }}>
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
  
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/signin")
    }
  }, [user, isLoading, router])
  
  return { user, isLoading }
} 