"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { apiClient, MoodleLoginResult } from "./api-client";
import { getMoodleUserByField } from "./api-utils";

export type User = {
  id: string;
  token: string;
  username: string;
  name: string;
  email: string;
  role: string;
  moodleId: string;
  avatarUrl?: string;
  level?: number;
  xp?: number;
  badges?: number;
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<MoodleLoginResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Mark component as mounted on client-side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // TEMPORARY: Auto-login with dummy teacher account for development
  useEffect(() => {
    if (isMounted) {
      console.info(
        "🔧 DEVELOPMENT MODE: Auto-logging in with dummy teacher account"
      );

      // Create dummy teacher user
      const dummyTeacher: User = {
        id: "1",
        token: "dev-token-123",
        username: "dev-teacher",
        name: "Development Teacher",
        email: "dev-teacher@example.com",
        role: "teacher",
        moodleId: "1",
        avatarUrl:
          "https://ui-avatars.com/api/?name=Dev+Teacher&background=4f46e5&color=fff",
        level: 10,
        xp: 5000,
        badges: 5,
      };

      // Set user and save to local storage
      setUser(dummyTeacher);
      // localStorage.setItem("moodlequest_user", JSON.stringify(dummyTeacher));

      // Update loading state
      setIsLoading(false);
    }
  }, [isMounted]);

  // Check for existing session on component mount - COMMENTED OUT FOR DEVELOPMENT
  /*
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
  */

  // Update token in API client whenever user changes
  useEffect(() => {
    if (user?.token) {
      apiClient.setToken(user.token);
    } else {
      apiClient.setToken("");
    }
  }, [user]);

  // Redirect unauthenticated users away from protected routes - COMMENTED OUT FOR DEVELOPMENT
  /*
  useEffect(() => {
    if (!isLoading && isMounted) {
      const publicRoutes = ["/signin", "/register", "/", "/learn-more", "/faq", "/about"]
      const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route))
      
      if (!user && !isPublicRoute) {
        router.push("/signin")
      }
    }
  }, [user, isLoading, isMounted, pathname, router])
  */

  const login = async (username: string, password: string) => {
    try {
      const result = await apiClient.login(username, password);

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
          badges: result.user.badges,
        };

        // If we have a token, try to get extended user info from Moodle
        if (userData.token) {
          try {
            const userInfoResult = await getMoodleUserByField(
              userData.token,
              "username",
              userData.username
            );

            if (userInfoResult.success && userInfoResult.user) {
              const moodleUser = userInfoResult.user;

              // Update user data with Moodle information
              userData.name =
                `${moodleUser.firstname || ""} ${
                  moodleUser.lastname || ""
                }`.trim() || userData.name;
              userData.email = moodleUser.email || userData.email;
              userData.avatarUrl =
                moodleUser.profileimageurl || userData.avatarUrl;

              // Store this updated user in backend - use AbortController to set timeout
              try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);

                // Attempt to store user data but don't let it block the login process
                fetch("/api/auth/moodle/store-user", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    moodleId: moodleUser.id,
                    username: userData.username,
                    email: userData.email,
                    firstName: moodleUser.firstname || "",
                    lastName: moodleUser.lastname || "",
                    token: userData.token,
                  }),
                  signal: controller.signal,
                })
                  .catch((storeError) => {
                    // Silently handle errors during store user - this shouldn't block login
                    console.warn(
                      "Non-critical: Failed to store user data in backend:",
                      storeError
                    );
                  })
                  .finally(() => {
                    clearTimeout(timeoutId);
                  });
              } catch (storeError) {
                // Silently ignore errors as they shouldn't block the login flow
                console.warn(
                  "Non-critical: Exception during store user setup:",
                  storeError
                );
              }
            }
          } catch (userInfoError) {
            console.warn("Failed to get extended user info:", userInfoError);
          }
        }

        setUser(userData);
        // localStorage.setItem("moodlequest_user", JSON.stringify(userData));
      }

      return result;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    // Clear user state first to prevent unauthorized requests
    setUser(null);

    // Clear API client token
    apiClient.setToken("");

    // Clear all storage
    // localStorage.removeItem("moodlequest_user");
    localStorage.removeItem("moodle_user");

    localStorage.removeItem("theme");
    sessionStorage.clear();

    // Clear any cookies related to authentication
    document.cookie.split(";").forEach((cookie) => {
      const [name] = cookie.trim().split("=");
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });

    // Call API logout endpoint with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

    // fetch("/api/auth/moodle/logout", {
    //   method: "POST",
    //   signal: controller.signal,
    // })
    //   .catch((error) => {
    //     // Silently handle network errors during logout
    //     console.warn("Non-critical: Error during logout API call:", error);
    //   })
    //   .finally(() => {
    //     clearTimeout(timeoutId);

    //     // Force navigation and reload after cleanup
    //     window.setTimeout(() => {
    //       router.push("/signin");

    //       // After navigation initiated, force reload to clear any lingering state
    //       window.setTimeout(() => {
    //         window.location.reload();
    //       }, 100);
    //     }, 100);
    //   });

    router.push("/signin");
  };

  // Only provide the real context value after mounting on client
  const contextValue = isMounted
    ? { user, isLoading, login, logout }
    : { user: null, isLoading: true, login, logout };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useRequireAuth() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isLoading && !user) {
      router.push("/signin");
    }
  }, [user, isLoading, isMounted, router]);

  return { user, isLoading };
}
