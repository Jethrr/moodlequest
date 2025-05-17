"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  showIcon?: boolean
  className?: string
}

export function LogoutButton({
  variant = "outline",
  size = "sm",
  showIcon = true,
  className = ""
}: LogoutButtonProps) {
  const { logout } = useAuth()
  
  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={logout} 
      className={className}
    >
      {showIcon && <LogOut className="h-4 w-4 mr-2" />}
      Sign Out
    </Button>
  )
} 