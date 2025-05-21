import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const MOODLE_URL = process.env.NEXT_PUBLIC_MOODLE_URL || 'https://moodle50:8890';

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;
    
    // Get auth token from cookies
    const moodleUser = req.cookies.get('moodleUser');
    const moodleToken = req.cookies.get('moodleToken');

    if (!moodleUser?.value || !moodleToken?.value) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userData = JSON.parse(moodleUser.value);

    // Try to fetch from FastAPI backend first
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${moodleToken.value}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({ success: true, user: data });
      }
    } catch (error) {
      console.warn('FastAPI user fetch failed, falling back to Moodle API');
    }

    // If FastAPI fails, fallback to Moodle API
    // Build Moodle API parameters
    const moodleParams = new URLSearchParams({
      wstoken: moodleToken.value,
      wsfunction: 'core_user_get_users_by_field',
      field: 'id',
      'values[0]': userId,
      moodlewsrestformat: 'json'
    });

    // Make request to Moodle API
    const response = await fetch(
      `${MOODLE_URL}/webservice/rest/server.php?${moodleParams.toString()}`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error fetching user profile:', errorData);
      return NextResponse.json({ 
        error: errorData.message || 'Failed to fetch user profile'
      }, { status: response.status });
    }

    const data = await response.json();
    
    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ 
        error: 'User not found'
      }, { status: 404 });
    }

    const moodleUserData = data[0];

    // Transform Moodle user data to match our format
    const user = {
      id: moodleUserData.id,
      username: moodleUserData.username,
      name: `${moodleUserData.firstname || ''} ${moodleUserData.lastname || ''}`.trim() || moodleUserData.username,
      email: moodleUserData.email || `${moodleUserData.username}@example.com`,
      role: userData.role || 'student',
      avatarUrl: moodleUserData.profileimageurl || null
    };

    return NextResponse.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch user profile'
    }, { status: 500 });
  }
} 