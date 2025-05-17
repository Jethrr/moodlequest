// Adapted from shadcn/ui toast component
import { ReactNode } from "react"

type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

// Simple toast function - in a real app, you'd implement a proper toast system
export function toast({ title, description, variant = "default" }: ToastProps) {
  console.log(`[Toast - ${variant}]`, title, description)
  // In a real app, this would show an actual toast notification UI
  alert(`${title || ""}\n${description || ""}`)
} 