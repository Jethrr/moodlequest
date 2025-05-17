import { type NextRequest, NextResponse } from "next/server"
import { exchangeCodeForToken, getMoodleUserInfo } from "@/lib/moodle-api"
import { AuthMethod } from "@/lib/moodle-auth"

/**
 * Handles the OAuth callback from Moodle
 * This route is called by Moodle after the user authorizes the application
 */
export async function GET(request: NextRequest) {
  try {
    // Get the authorization code from the URL
    const url = new URL(request.url)
    const code = url.searchParams.get("code")
    
    if (!code) {
      return NextResponse.redirect(new URL("/signin?error=missing_code", request.url))
    }
    
    // Exchange the code for an access token
    const token = await exchangeCodeForToken(code)
    
    // Get the user information using the token
    const user = await getMoodleUserInfo(token)
    
    // Store the user in a secure HTTP-only cookie
    // In a real implementation, you would use a more secure method like server sessions
    const response = NextResponse.redirect(new URL("/dashboard", request.url))
    
    // Set a secure cookie with the user information
    // This is a simplified example - in production, use a proper session management system
    response.cookies.set({
      name: "user",
      value: JSON.stringify(user),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })
    
    // Also store the token for API calls
    response.cookies.set({
      name: "moodle_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })
    
    return response
  } catch (error) {
    console.error("Moodle OAuth callback error:", error)
    return NextResponse.redirect(new URL("/signin?error=auth_failed", request.url))
  }
}