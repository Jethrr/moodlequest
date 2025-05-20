import { NextRequest, NextResponse } from 'next/server';
import { getMoodleUserByField } from '@/lib/api-utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const authHeader = request.headers.get('Authorization');
    
    // First try to get user data from our backend
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/profile`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': authHeader || '',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({ success: true, data });
      }
    } catch (backendError) {
      console.warn('Backend profile fetch failed:', backendError);
      // Continue to try Moodle fallback
    }
    
    // Extract token from authorization header
    let token = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      // Get token from request cookies
      const tokenCookie = request.cookies.get('moodlequest_token');
      if (tokenCookie) {
        token = tokenCookie.value;
      }
    }
    
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication token required'
      }, { status: 401 });
    }
    
    // Get username from request cookies or query params
    let username = '';
    const usernameCookie = request.cookies.get('moodlequest_username');
    if (usernameCookie) {
      username = usernameCookie.value;
    } else {
      // Try to get from URL searchParams
      const url = new URL(request.url);
      username = url.searchParams.get('username') || '';
    }
    
    if (!username) {
      return NextResponse.json({ 
        success: false, 
        error: 'Username not found'
      }, { status: 400 });
    }
    
    // Fetch user data from Moodle
    const moodleUserResult = await getMoodleUserByField(token, 'username', username);
    
    if (!moodleUserResult.success) {
      return NextResponse.json({ 
        success: false, 
        error: moodleUserResult.error || 'Failed to fetch Moodle user'
      }, { status: 404 });
    }
    
    const moodleUser = moodleUserResult.user;
    
    // Transform Moodle user data to profile data structure
    const profileData = {
      id: userId,
      username: moodleUser.username,
      first_name: moodleUser.firstname || '',
      last_name: moodleUser.lastname || '',
      email: moodleUser.email || `${moodleUser.username}@example.com`,
      profile_image_url: moodleUser.profileimageurl || "/avatars/placeholder.jpg",
      role: "student", // Default role
      level: 1,
      learning_score: 3,
      joined_date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      school: moodleUser.institution || "Unknown School",
      department: moodleUser.department || "General Studies",
      badges_collected: [],
      stats: {
        finished_skills: 0,
        watched_workflows: 0,
        viewed_time: "0min",
        courses_completed: 0,
        quests_completed: 0,
        exp_points: 0
      },
      certificates: [],
      ranking: {
        position: 0,
        total_students: 0
      }
    };
    
    return NextResponse.json({ success: true, data: profileData });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch profile'
    }, { status: 500 });
  }
} 