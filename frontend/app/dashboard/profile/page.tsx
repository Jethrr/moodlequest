"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect, useState } from "react"
import { fetchUserProfile } from '@/lib/profile-service'
import { useRouter } from "next/navigation"
import { Edit, ExternalLink } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function ProfilePage() {
  const { user, isLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<any>(null)
  const router = useRouter()

  // Redirect to signin if user is not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/signin')
    }
  }, [isLoading, user, router])

  // Fetch profile data when user is available
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return
      
      try {
        const data = await fetchUserProfile(user)
        if (data) {
          setProfileData(data)
        }
      } catch (error) {
        console.error('Error loading profile data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    if (user) {
      loadProfileData()
    }
  }, [user])

  // Show loading during initial loading or profile data fetching
  if (isLoading || loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="py-8 flex justify-center">
            <div className="w-8 h-8 border-t-2 border-b-2 border-current rounded-full animate-spin"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  }

  // Only after mounting and loading is complete, show signed out or profile content
  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="container mx-auto py-8 px-4"
    >
      {!user ? (
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Not Signed In</h2>
                <p className="text-muted-foreground">Please sign in to view your profile.</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <Avatar className="h-20 w-20">
                  {profileData?.profile_image_url ? (
                    <AvatarImage src={profileData.profile_image_url} alt={user.name || user.username} />
                  ) : null}
                  <AvatarFallback>{((profileData?.first_name || user.name || user.username) || "U").charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="text-2xl">{profileData?.first_name && profileData?.last_name ? 
                        `${profileData.first_name} ${profileData.last_name}` : 
                        (user.name || user.username)}</CardTitle>
                      <CardDescription className="text-base">{profileData?.email || user.email || "No email provided"}</CardDescription>
                      <Badge variant="secondary" className="mt-2">
                        {profileData?.role ? profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1) : 
                        (user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Student")}
                      </Badge>
                    </div>
                    <div className="mt-4 sm:mt-0">
                      <Button asChild className="flex items-center gap-2">
                        <Link href="/dashboard/profile/edit">
                          <Edit className="h-4 w-4" />
                          Edit Profile
                        </Link>
                      </Button>
                    </div>
                  </div>
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
                      <span className="text-muted-foreground">{profileData?.username || user.username}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span className="font-medium min-w-[100px]">Email:</span>
                      <span className="text-muted-foreground">{profileData?.email || user.email || "Not provided"}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span className="font-medium min-w-[100px]">Role:</span>
                      <span className="text-muted-foreground capitalize">{profileData?.role || user.role || "Student"}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span className="font-medium min-w-[100px]">Moodle ID:</span>
                      <span className="text-muted-foreground">{user.moodleId || "Not available"}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span className="font-medium min-w-[100px]">Joined:</span>
                      <span className="text-muted-foreground">{profileData?.joined_date || "Unknown"}</span>
                    </div>
                    {profileData?.bio && (
                      <div className="flex flex-col gap-1 mt-2">
                        <span className="font-medium">Bio:</span>
                        <p className="text-muted-foreground text-sm">{profileData.bio}</p>
                      </div>
                    )}
                  </div>
                </div>
                {(profileData?.stats || user.level) && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Progress</h3>
                    <div className="grid gap-3">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className="font-medium min-w-[100px]">Level:</span>
                        <span className="text-muted-foreground">{profileData?.level || user.level || 1}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className="font-medium min-w-[100px]">XP:</span>
                        <span className="text-muted-foreground">{profileData?.stats?.exp_points || user.xp || 0}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className="font-medium min-w-[100px]">Completed:</span>
                        <span className="text-muted-foreground">{profileData?.stats?.quests_completed || 0} quests, {profileData?.stats?.courses_completed || 0} courses</span>
                      </div>
                    </div>
                  </div>
                )}
                {profileData?.social_media && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Social Media</h3>
                    <div className="grid gap-3">
                      {profileData.social_media.twitter && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium min-w-[100px]">Twitter:</span>
                          <a 
                            href={`https://twitter.com/${profileData.social_media.twitter}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline flex items-center gap-1"
                          >
                            @{profileData.social_media.twitter}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                      {profileData.social_media.github && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium min-w-[100px]">GitHub:</span>
                          <a 
                            href={`https://github.com/${profileData.social_media.github}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline flex items-center gap-1"
                          >
                            {profileData.social_media.github}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
} 