import { useState, useEffect } from "react";

export interface MoodleUser {
  id: number;
  username: string;
  email: string;
  role: string;
  first_name?: string;
  last_name?: string;
  moodle_user_id?: number;
  is_active: boolean;
  created_at: string;
}

export function useCurrentUser() {
  const [user, setUser] = useState<MoodleUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      // Check if we're in a browser environment
      if (typeof window !== "undefined") {
        const userData = localStorage.getItem("moodle_user");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        }
      }
    } catch (err) {
      console.error("Error getting user from localStorage:", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to update user data
  const updateUser = (userData: MoodleUser) => {
    try {
      localStorage.setItem("moodleUser", JSON.stringify(userData));
      setUser(userData);
    } catch (err) {
      console.error("Error updating user in localStorage:", err);
      setError(err as Error);
    }
  };

  // Function to clear user data (for logout)
  const clearUser = () => {
    try {
      localStorage.removeItem("moodleUser");
      setUser(null);
    } catch (err) {
      console.error("Error clearing user from localStorage:", err);
      setError(err as Error);
    }
  };

  return {
    user,
    loading,
    error,
    updateUser,
    clearUser,
    isAuthenticated: !!user,
    isTeacher: user?.role === "teacher",
    isStudent: user?.role === "student",
    isAdmin: user?.role === "admin",
  };
}
