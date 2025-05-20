"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { AlertCircle, RefreshCcw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function SimplifiedMoodleForm() {
  const router = useRouter()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [networkError, setNetworkError] = useState("")
  const [isRetrying, setIsRetrying] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError("")
    setNetworkError("")

    const formData = new FormData(event.currentTarget)
    const username = formData.get("username") as string
    const password = formData.get("password") as string

    if (!username || !password) {
      setError("Username and password are required");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Attempting to sign in with Moodle");
      
      // Use the updated API route that directly communicates with Moodle
      const response = await fetch("/api/auth/moodle/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          service: "modquest", // This should match the service name in Moodle
        }),
      });
      
      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        console.error("Error parsing response:", parseError);
        throw new Error("Invalid response from server. The service might be unavailable.");
      }
      
      if (!response.ok) {
        console.error("Login API error:", response.status, result?.error);
        throw new Error(result?.error || `Authentication failed: ${response.statusText}`);
      }
      
      if (result.success && result.token && result.user) {
        console.log("Login successful, storing user data");
        
        // Create a complete user object with all required fields
        const userData = {
          id: result.user.id || "",
          token: result.token || "",
          privateToken: result.privateToken || "",
          username: result.user.username || username,
          name: result.user.name || username,
          email: result.user.email || "",
          role: result.user.role || "student",
          moodleId: result.user.moodleId || result.user.id || "",
          avatarUrl: result.user.avatarUrl || "",
        };

        // Store complete user data in localStorage
        localStorage.setItem("moodlequest_user", JSON.stringify(userData));
        
        // Update the auth context
        try {
          await login(username, password);
        } catch (authError) {
          // If login fails, still proceed with the stored user data
          console.warn("Auth context update failed, but continuing with login flow", authError);
        }
        
        // Redirect based on user role
        if (userData.role === "teacher" || userData.role === "admin") {
          router.push("/teacher/dashboard");
        } else {
          router.push("/dashboard");
        }
      } else {
        console.error("Login failed:", result.error);
        setError(result.error || "Authentication failed. Please check your credentials.");
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      
      // Different handling based on error type
      if (error.message.includes("Failed to fetch") || 
          error.message.includes("NetworkError") || 
          error.message.includes("network") ||
          error.message.includes("ECONNREFUSED") ||
          error.message.includes("Invalid response")) {
        setNetworkError(
          "Network error when attempting to connect to Moodle. Please check your connection or contact your administrator."
        );
        setIsRetrying(false);
      } else if (error.message.includes("token")) {
        setError("Authentication failed. Please check your Moodle username and password.");
      } else {
        setError(error.message || "An unexpected error occurred. Please try again later.");
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetry = () => {
    setIsRetrying(true);
    setNetworkError("");
    
    // Simulate API check
    fetch("/api/health-check")
      .then(response => {
        if (response.ok) {
          setNetworkError("Network connection restored. Please try logging in again.");
          setTimeout(() => setNetworkError(""), 3000);
        } else {
          setNetworkError("Network issues persist. Please contact your administrator.");
        }
      })
      .catch(() => {
        setNetworkError("Still experiencing network issues. Check your connection and try again.");
      })
      .finally(() => {
        setIsRetrying(false);
      });
  };

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
        
        {error && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs ml-2">{error}</AlertDescription>
          </Alert>
        )}
        
        {networkError && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs ml-2 flex justify-between items-center">
              <span>{networkError}</span>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-6 text-xs ml-2 flex items-center gap-1"
                onClick={handleRetry}
                disabled={isRetrying}
              >
                <RefreshCcw className="h-3 w-3" /> 
                {isRetrying ? "Checking..." : "Retry"}
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
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