"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect, useState } from "react"

export default function ProfilePage() {
  const { user, isLoading } = useAuth()
  const [mounted, setMounted] = useState(false)

  // Handle client-side effects
  useEffect(() => {
    setMounted(true)
  }, [])

  // While not mounted or loading, show skeleton
  if (!mounted || isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Only after mounting and loading is complete, show signed out or profile content
  return (
    <div className="container mx-auto py-8 px-4">
      {!user ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Not Signed In</h2>
              <p className="text-muted-foreground">Please sign in to view your profile.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <Avatar className="h-20 w-20">
                {user.avatarUrl ? (
                  <AvatarImage src={user.avatarUrl} alt={user.name || user.username} />
                ) : null}
                <AvatarFallback>{(user.name || user.username || "U").charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left">
                <CardTitle className="text-2xl">{user.name || user.username}</CardTitle>
                <CardDescription className="text-base">{user.email || "No email provided"}</CardDescription>
                <Badge variant="secondary" className="mt-2">
                  {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Student"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Account Information</h3>
                <div className="grid gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="font-medium min-w-[100px]">Username:</span>
                    <span className="text-muted-foreground">{user.username}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="font-medium min-w-[100px]">Email:</span>
                    <span className="text-muted-foreground">{user.email || "Not provided"}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="font-medium min-w-[100px]">Role:</span>
                    <span className="text-muted-foreground capitalize">{user.role || "Student"}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="font-medium min-w-[100px]">Moodle ID:</span>
                    <span className="text-muted-foreground">{user.moodleId || "Not available"}</span>
                  </div>
                </div>
              </div>
              {user.level && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Progress</h3>
                  <div className="grid gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span className="font-medium min-w-[100px]">Level:</span>
                      <span className="text-muted-foreground">{user.level}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span className="font-medium min-w-[100px]">XP:</span>
                      <span className="text-muted-foreground">{user.xp || 0}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span className="font-medium min-w-[100px]">Badges:</span>
                      <span className="text-muted-foreground">{user.badges || 0}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 