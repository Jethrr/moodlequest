import { type NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002/api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      moodleId,
      username,
      email,
      firstName,
      lastName,
      token,
      privateToken,
      profileImageUrl,
      bio,
    } = body;

    // Forward the request to our backend service
    const response = await fetch(`${API_BASE_URL}/auth/moodle/store-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        moodleId,
        username,
        email,
        firstName,
        lastName,
        token,
        privateToken,
        profileImageUrl,
        bio,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend storage error: ${response.status} ${errorText}`);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to store user data: ${
            errorText || response.statusText
          }`,
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("User storage error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to store user data.",
      },
      { status: 500 }
    );
  }
}
