import { type NextRequest, NextResponse } from "next/server"
import { getMoodleOAuthUrl } from "@/lib/moodle-api"

/**
 * Redirects to the Moodle OAuth authorization URL
 */
export async function GET(request: NextRequest) {
  try {
    // Get the OAuth URL
    const authUrl = getMoodleOAuthUrl()
    
    // Redirect to the Moodle OAuth page
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error("Moodle OAuth error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to initiate OAuth flow" },
      { status: 500 }
    )
  }
}