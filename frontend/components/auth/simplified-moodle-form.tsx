"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getMoodleUserByField } from "@/lib/api-utils";
import { PetLoader } from "@/components/ui/pet-loader";
import { motion, AnimatePresence } from "framer-motion";

export function SimplifiedMoodleForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState<
    "connecting" | "authenticating" | "redirecting" | "complete"
  >("connecting");
  const [error, setError] = useState("");
  const [networkError, setNetworkError] = useState("");
  const [isRetrying, setIsRetrying] = useState(false);
  const [formVisible, setFormVisible] = useState(true);

  // Create a loading timer to show various loading stages even if the server responds quickly
  useEffect(() => {
    if (!isLoading) return;

    // Simulate loading phases
    let authTimer: NodeJS.Timeout;
    let redirectTimer: NodeJS.Timeout;
    let completeTimer: NodeJS.Timeout;

    // Min times for each phase to ensure the animation plays
    const authTime = setTimeout(() => {
      setLoadingPhase("authenticating");
      authTimer = setTimeout(() => {
        // Only proceed if we're still in authenticating phase (not errored)
        if (isLoading && loadingPhase === "authenticating") {
          setLoadingPhase("redirecting");
          redirectTimer = setTimeout(() => {
            setLoadingPhase("complete");
            completeTimer = setTimeout(() => {
              // Auto-redirect will happen via the form submit logic
            }, 1000);
          }, 1000);
        }
      }, 1000);
    }, 800);

    return () => {
      clearTimeout(authTime);
      clearTimeout(authTimer);
      clearTimeout(redirectTimer);
      clearTimeout(completeTimer);
    };
  }, [isLoading, loadingPhase]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setNetworkError("");
    setLoadingPhase("connecting");
    setFormVisible(false);

    const formData = new FormData(event.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    if (!username || !password) {
      setError("Username and password are required");
      setIsLoading(false);
      setFormVisible(true);
      return;
    }

    try {
      console.log("Attempting Moodle login...");

      // First get the login token from Moodle
      const loginController = new AbortController();
      const loginTimeout = setTimeout(() => loginController.abort(), 15000);

      const result = await fetch("/api/auth/moodle/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        signal: loginController.signal,
      })
        .then((res) => res.json())
        .finally(() => {
          clearTimeout(loginTimeout);
        });

      //  && result.token && result.user

      if (result.success) {
        console.log("Login successful, storing user data");
        // console.log("User Role", result.user.role);

        // Create a complete user object with all required fields
        const userData = {
          id: result.user.id || "",
          token: result.token || "",
          privateToken: result.privateToken || "",
          username: result.user.username || username,
          name: result.user.name || username,
          email: result.user.email || "",
          role: result.user.role,
          moodleId: result.user.moodleId || result.user.id || "",
          avatarUrl: result.user.avatarUrl || "",
        };

        console.log("User Data: ", userData);

        // console.log("User Role From Client: ", userData.role);

        // Store complete user data in localStorage
        localStorage.setItem("moodle_user", JSON.stringify(userData));

        setLoadingPhase("authenticating");

        // Update the auth context and prepare for redirect
        try {
          await login(username, password);
          proceedWithRedirect(userData);
        } catch (authError) {
          console.warn(
            "Auth context update failed, but continuing with login flow",
            authError
          );
          // Still proceed with the redirect even if auth context update fails
          proceedWithRedirect(userData);
        }
      } else {
        console.error("Login failed:", result.error);
        setError(
          result.error ||
            "Authentication failed. Please check your credentials."
        );
        setIsLoading(false);
        setFormVisible(true);
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      if (error.name === "AbortError" || error.name === "TimeoutError") {
        setError("Login request timed out. Server might be unavailable.");
      } else {
        setError(
          error.message || "Failed to connect to Moodle. Please try again."
        );
      }
      setIsLoading(false);
      setFormVisible(true);
    }
  }

  // Helper function to handle redirection
  const proceedWithRedirect = (userData: any) => {
    setLoadingPhase("redirecting");

    // Force a minimum loading time for better UX
    setTimeout(() => {
      setLoadingPhase("complete");

      setTimeout(() => {
        if (userData.role === "teacher" || userData.role === "admin") {
          router.push("/dashboard/teacher");
        } else {
          router.push("/dashboard");
        }
      }, 500);
    }, 800);
  };

  const handleRetry = () => {
    setIsRetrying(true);
    setNetworkError("");

    // Simulate API check
    fetch("/api/health-check")
      .then((response) => {
        if (response.ok) {
          setNetworkError(
            "Network connection restored. Please try logging in again."
          );
          setTimeout(() => setNetworkError(""), 3000);
        } else {
          setNetworkError(
            "Network issues persist. Please contact your administrator."
          );
        }
      })
      .catch(() => {
        setNetworkError(
          "Still experiencing network issues. Check your connection and try again."
        );
      })
      .finally(() => {
        setIsRetrying(false);
      });
  };

  return (
    <div className="grid gap-4">
      <AnimatePresence mode="wait">
        {formVisible ? (
          <motion.div
            key="login-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <form onSubmit={onSubmit} className="space-y-3">
              <div className="grid gap-1.5">
                <Label htmlFor="username" className="text-sm">
                  Moodle Username
                </Label>
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
                  <Label htmlFor="password" className="text-sm">
                    Password
                  </Label>
                  <Button variant="link" className="h-auto p-0 text-xs" asChild>
                    <a href="/forgot-password">Forgot password?</a>
                  </Button>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  autoCapitalize="none"
                  disabled={isLoading}
                  required
                  className="h-9"
                />
              </div>

              {error && (
                <Alert variant="destructive" className="py-2 mt-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5" />
                    <AlertDescription className="text-xs">
                      {error}
                    </AlertDescription>
                  </div>
                </Alert>
              )}

              {networkError && (
                <Alert variant="destructive" className="py-2 mt-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 mt-0.5" />
                      <AlertDescription className="text-xs">
                        {networkError}
                      </AlertDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 text-xs flex items-center gap-1 shrink-0"
                      onClick={handleRetry}
                      disabled={isRetrying}
                    >
                      <RefreshCcw className="h-3 w-3" />
                      {isRetrying ? "Checking..." : "Retry"}
                    </Button>
                  </div>
                </Alert>
              )}

              <Button
                disabled={isLoading}
                type="submit"
                className="w-full h-9 mt-2"
              >
                {isLoading ? "Signing in..." : "Sign In with Moodle"}
              </Button>
            </form>
            <div className="text-center text-xs text-muted-foreground mt-1">
              <span className="block">Need help? </span>
              <Button variant="link" className="h-auto p-0 text-xs">
                <a
                  href="https://moodle.org/support"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit Moodle Support
                </a>
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="pet-loader"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="min-h-[300px] flex items-center justify-center"
          >
            <PetLoader loadingPhase={loadingPhase} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
