import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const MOODLE_URL = process.env.NEXT_PUBLIC_MOODLE_URL || "http://localhost";

export async function GET(req: NextRequest) {
  try {
    // Get auth token from cookies
    const moodleUser = req.cookies.get("moodleUser");
    const moodleToken = req.cookies.get("moodleToken");

    if (!moodleUser?.value || !moodleToken?.value) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userData = JSON.parse(moodleUser.value);

    // Try FastAPI backend first
    try {
      const response = await fetch(`${API_BASE_URL}/courses/sync`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${moodleToken.value}`,
        },
        next: { revalidate: 0 }, // Don't cache this request
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({
          success: true,
          courses: data.courses,
          count: data.courses.length,
        });
      } else {
        console.warn("FastAPI course sync failed, falling back to Moodle API");
      }
    } catch (error) {
      console.warn("FastAPI course sync error:", error);
      // Continue to Moodle fallback
    }

    // Fallback to direct Moodle API call
    const moodleParams = new URLSearchParams({
      wstoken: moodleToken.value,
      wsfunction: "core_enrol_get_users_courses",
      userid: userData.id.toString(),
      moodlewsrestformat: "json",
    });

    const response = await fetch(
      `${MOODLE_URL}/webservice/rest/server.php?${moodleParams.toString()}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 0 }, // Don't cache this request
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error syncing courses from Moodle:", errorData);
      return NextResponse.json(
        {
          error: errorData.message || "Failed to sync courses",
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Transform Moodle response to match our API format
    const courses = Array.isArray(data)
      ? data.map((course) => ({
          id: course.id,
          title: course.fullname,
          short_name: course.shortname,
          description: course.summary,
          visible: course.visible === 1,
          start_date: course.startdate
            ? new Date(course.startdate * 1000).toISOString()
            : null,
          end_date: course.enddate
            ? new Date(course.enddate * 1000).toISOString()
            : null,
          moodle_course_id: course.id,
          enrollment: {
            role: course.role || "student",
            completion: course.progress || 0,
            last_access: course.lastaccess
              ? new Date(course.lastaccess * 1000).toISOString()
              : null,
          },
        }))
      : [];

    return NextResponse.json({
      success: true,
      courses,
      count: courses.length,
    });
  } catch (error) {
    console.error("Course sync error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to sync courses",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  // Same functionality as GET but allows for specifying additional options in request body
  const body = await req.json();

  // Get request instance with the new query params
  const url = new URL(req.url);
  Object.entries(body).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });

  const newReq = new NextRequest(url, {
    headers: req.headers,
    method: "GET",
  });

  return GET(newReq);
}
