'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ProfileContent } from '@/components/user/profile-content';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';

interface User {
  id: number;
  username: string;
  email: string;
  name?: string;
  role: string;
  avatarUrl?: string;
  level?: number;
  exp?: number;
  joinedAt?: string;
}

export default function ProfilePage() {
  const params = useParams();
  const userId = params?.userId as string;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (userId) {
      fetchUserProfile(userId);
    }
  }, [userId]);
  
  const fetchUserProfile = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch user profile from API
      const response = await fetch(`/api/users/${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user profile: ${response.status}`);
      }
      
      const data = await response.json();
      setUser(data.user);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="grid gap-6 md:grid-cols-7">
          <div className="md:col-span-2">
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="md:col-span-5">
            <Skeleton className="h-16 w-full mb-4" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !user) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load user profile</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{error || 'User not found'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return <ProfileContent user={user} />;
} 