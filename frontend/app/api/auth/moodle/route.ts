import { type NextRequest, NextResponse } from "next/server"
import { authenticateWithMoodle, AuthMethod, UserRole, generateMFAChallenge } from "@/lib/moodle-auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password, method } = body

    // Authenticate with Moodle
    const authResult = await authenticateWithMoodle({ username, password }, method || AuthMethod.MOODLE_SSO)

    // If authentication successful and user is admin, require MFA
    if (authResult.success && authResult.user?.role === UserRole.ADMIN) {
      const mfaChallenge = await generateMFAChallenge(authResult.user.id)

      return NextResponse.json({
        success: true,
        requiresMfa: true,
        mfaChallenge,
        user: {
          id: authResult.user.id,
          name: authResult.user.name,
          email: authResult.user.email,
          role: authResult.user.role,
        },
      })
    }

    return NextResponse.json(authResult)
  } catch (error) {
    console.error("Authentication error:", error)
    return NextResponse.json({ success: false, error: "Authentication failed" }, { status: 500 })
  }
}
