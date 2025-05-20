import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

type Role = "student" | "teacher" | "admin";

/**
 * Hook for protecting routes based on user role
 * @param requiredRole The role required to access the route
 * @param redirectTo Where to redirect if user doesn't have required role
 */
export function useRoleProtection(requiredRole: Role, redirectTo: string = "/dashboard") {
   const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      // Check if user has required role
      const userRole = user.role as Role;
      
      if (!hasRequiredRole(userRole, requiredRole)) {
        router.push(redirectTo);
      }
    }
  }, [user, isLoading, requiredRole, redirectTo, router]);
  return { isAuthorized: user?.role && hasRequiredRole(user.role as Role, requiredRole), isLoading };
}

/**
 * Check if a user role has the required permissions
 * @param userRole The user's role
 * @param requiredRole The role required to access a resource
 */
function hasRequiredRole(userRole: Role, requiredRole: Role): boolean {
  if (userRole === "admin") return true; // Admin has access to everything
  if (userRole === "teacher" && requiredRole === "student") return true; // Teachers can access student resources
  return userRole === requiredRole; // Otherwise, roles must match exactly
}

/**
 * Hook for protecting teacher routes
 * @param redirectTo Where to redirect non-teachers
 */
export function useTeacherProtection(redirectTo: string = "/dashboard") {
  return useRoleProtection("teacher", redirectTo);
}

/**
 * Hook for protecting student routes
 * @param redirectTo Where to redirect non-students
 */
export function useStudentProtection(redirectTo: string = "/teacher/dashboard") {
  return useRoleProtection("student", redirectTo);
}

/**
 * Hook for protecting admin routes
 * @param redirectTo Where to redirect non-admins
 */
export function useAdminProtection(redirectTo: string = "/dashboard") {
  return useRoleProtection("admin", redirectTo);
} 