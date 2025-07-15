"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  apiClient,
  type TeacherProfile,
  type TeacherProfileUpdate,
} from "@/lib/api-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save, User } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function EditTeacherProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<TeacherProfile | null>(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    bio: "",
    profile_image_url: "",
  });

  // Redirect if not a teacher
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/signin");
    }
    if (!isLoading && user && user.role !== "teacher") {
      router.push("/dashboard");
    }
  }, [isLoading, user, router]);

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user || user.role !== "teacher") return;

      try {
        setLoading(true);
        const profile = await apiClient.getTeacherProfile();
        setProfileData(profile);
        setFormData({
          first_name: profile.first_name || "",
          last_name: profile.last_name || "",
          bio: profile.bio || "",
          profile_image_url: profile.profile_image_url || "",
        });
      } catch (error) {
        console.error("Error loading profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === "teacher") {
      loadProfile();
    }
  }, [user, toast]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData) return;

    try {
      setSaving(true);

      // Only send fields that have changed
      const updateData: TeacherProfileUpdate = {};
      if (formData.first_name !== (profileData.first_name || "")) {
        updateData.first_name = formData.first_name;
      }
      if (formData.last_name !== (profileData.last_name || "")) {
        updateData.last_name = formData.last_name;
      }
      if (formData.bio !== (profileData.bio || "")) {
        updateData.bio = formData.bio;
      }
      if (
        formData.profile_image_url !== (profileData.profile_image_url || "")
      ) {
        updateData.profile_image_url = formData.profile_image_url;
      }

      // If no changes, just redirect
      if (Object.keys(updateData).length === 0) {
        toast("No changes were made to your profile");
        router.push("/teacher/profile");
        return;
      }

      await apiClient.updateTeacherProfile(updateData);

      toast.success("Profile updated successfully");

      router.push("/teacher/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user || !profileData) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
              <p className="text-muted-foreground">
                Unable to load profile information.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayName =
    formData.first_name && formData.last_name
      ? `${formData.first_name} ${formData.last_name}`
      : user.name || user.username;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid gap-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/teacher/profile">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Profile</h1>
            <p className="text-muted-foreground">
              Update your profile information
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Profile Preview */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  {formData.profile_image_url ? (
                    <AvatarImage
                      src={formData.profile_image_url}
                      alt={displayName}
                    />
                  ) : null}
                  <AvatarFallback className="text-lg">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{displayName}</h3>
                  <p className="text-muted-foreground">{profileData.email}</p>
                  {formData.bio && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {formData.bio}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Form */}
          <Card>
            <CardHeader>
              <CardTitle>Edit Information</CardTitle>
              <CardDescription>
                Update your personal information and profile details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                {/* Name Fields */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) =>
                        handleInputChange("first_name", e.target.value)
                      }
                      placeholder="Enter your first name"
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) =>
                        handleInputChange("last_name", e.target.value)
                      }
                      placeholder="Enter your last name"
                      maxLength={100}
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.bio.length}/500 characters
                  </p>
                </div>

                {/* Profile Image URL */}
                <div className="space-y-2">
                  <Label htmlFor="profile_image_url">Profile Image URL</Label>
                  <Input
                    id="profile_image_url"
                    type="url"
                    value={formData.profile_image_url}
                    onChange={(e) =>
                      handleInputChange("profile_image_url", e.target.value)
                    }
                    placeholder="https://example.com/your-image.jpg"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a URL to your profile image
                  </p>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/teacher/profile">Cancel</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
