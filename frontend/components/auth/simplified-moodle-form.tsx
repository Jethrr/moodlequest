"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"

export function SimplifiedMoodleForm() {
  const router = useRouter()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(event.currentTarget)
    const username = formData.get("username") as string
    const password = formData.get("password") as string

    try {
      const result = await login(username, password)

      if (result.success) {
        // After successful login, get the updated user from localStorage
        // Small timeout to ensure the auth context has had time to update localStorage
        setTimeout(() => {
          try {
            const storedUser = localStorage.getItem("moodlequest_user")
            if (storedUser) {
              const userData = JSON.parse(storedUser)
              // Redirect based on role
              if (userData.role === "teacher" || userData.role === "admin") {
                router.push("/teacher/dashboard")
              } else {
                router.push("/dashboard")
              }
            } else {
              // Default fallback if user data isn't available
              router.push("/dashboard")
            }
          } catch (e) {
            console.error("Error reading user data for redirect:", e)
            router.push("/dashboard") // Fallback
          }
        }, 100)
      } else {
        setError(result.error || "Authentication failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-4">
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="grid gap-1.5">
          <Label htmlFor="username" className="text-sm">Moodle Username</Label>
          <Input
            id="username"
            name="username"
            placeholder="Enter your username"
            type="text"
            autoCapitalize="none"
            autoCorrect="off"
            disabled={isLoading}
            required
            className="h-9"
          />
        </div>
        <div className="grid gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm">Password</Label>
            <Button variant="link" className="h-auto p-0 text-xs" asChild>
              <a href="/forgot-password">Forgot password?</a>
            </Button>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoCapitalize="none"
            disabled={isLoading}
            required
            className="h-9"
          />
        </div>
        {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
        <Button disabled={isLoading} type="submit" className="w-full h-9 mt-2">
          {isLoading ? "Signing in..." : "Sign In with Moodle"}
        </Button>
      </form>
      <div className="text-center text-xs text-muted-foreground mt-1">
        <span className="block">Need help? </span>
        <Button variant="link" className="h-auto p-0 text-xs">
          <a href="https://moodle.org/support" target="_blank" rel="noopener noreferrer">Visit Moodle Support</a>
        </Button>
      </div>
    </div>
  )
} 