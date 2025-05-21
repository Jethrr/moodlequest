import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const MOODLE_URL = process.env.NEXT_PUBLIC_MOODLE_URL || 'https://moodle50:8890';

export async function GET(req: NextRequest) {
  try {
    // Get user from cookies or query params
    const moodleUser = req.cookies.get('moodleUser');
    const moodleToken = req.cookies.get('moodleToken');
    const url = new URL(req.url);
    const userIdParam = url.searchParams.get('userId');
    const courseIdParam = url.searchParams.get('courseId');
    
    if (!moodleUser?.value || !moodleToken?.value) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userData = JSON.parse(moodleUser.value);

    // Try FastAPI backend first
    try {
      // Build query parameters for FastAPI
      const apiQueryParams = new URLSearchParams();
      
      if (userIdParam) {
        apiQueryParams.append('user_id', userIdParam);
      }
      
      if (courseIdParam) {
        apiQueryParams.append('course_id', courseIdParam);
      }
      
      const response = await fetch(
        `${API_BASE_URL}/courses?${apiQueryParams.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${moodleToken.value}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({
          success: true,
          courses: data.courses || data.items || data,
          count: (data.courses || data.items || data).length
        });
      } else {
        console.warn('FastAPI courses fetch failed, falling back to Moodle API');
      }
    } catch (error) {
      console.warn('FastAPI courses fetch error:', error);
      // Continue to Moodle fallback
    }

    // Fall back to direct Moodle API call
    const moodleParams = new URLSearchParams({
      wstoken: moodleToken.value,
      wsfunction: 'core_enrol_get_users_courses',
      userid: userIdParam || userData.id.toString(),
      moodlewsrestformat: 'json'
    });

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
      console.error('Error fetching courses from Moodle:', errorData);
      return NextResponse.json({ 
        error: errorData.message || 'Failed to fetch courses'
      }, { status: response.status });
    }
    
    const data = await response.json();

    // Transform Moodle response to match our API format
    const courses = Array.isArray(data) ? data.map(course => ({
      id: course.id,
      title: course.fullname,
      short_name: course.shortname,
      description: course.summary,
      visible: course.visible === 1,
      start_date: course.startdate ? new Date(course.startdate * 1000).toISOString() : null,
      end_date: course.enddate ? new Date(course.enddate * 1000).toISOString() : null,
      moodle_course_id: course.id,
      enrollment: {
        role: course.role || 'student',
        completion: course.progress || 0,
        last_access: course.lastaccess ? new Date(course.lastaccess * 1000).toISOString() : null
      }
    })) : [];

    return NextResponse.json({
      success: true,
      courses,
      count: courses.length
    });
  } catch (error) {
    console.error('Course fetch error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch courses'
    }, { status: 500 });
  }
}

// Allow filtering via query parameters
export async function POST(req: NextRequest) {
  try {
    const { filter } = await req.json();
    const moodleUser = req.cookies.get('moodleUser');
    const moodleToken = req.cookies.get('moodleToken');

    if (!moodleUser?.value || !moodleToken?.value) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Build filter object for FastAPI
    const apiFilter: any = {};
    
    if (filter?.courseCode) {
      apiFilter.course_code = filter.courseCode;
    }

    if (filter?.title) {
      apiFilter.title = filter.title;
    }

    if (filter?.userId) {
      apiFilter.user_id = filter.userId;
    }

    // Send request to FastAPI backend
    const response = await fetch(`${API_BASE_URL}/courses/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${moodleToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(apiFilter)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error searching courses:', errorData);
      return NextResponse.json({ 
        error: errorData.detail || 'Failed to search courses'
      }, { status: response.status });
    }
    
    const data = await response.json();

    return NextResponse.json({
      success: true,
      courses: data.courses || data.items || data,
      count: (data.courses || data.items || data).length
    });
  } catch (error) {
    console.error('Course search error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to search courses'
    }, { status: 500 });
  }
} 