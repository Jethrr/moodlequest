import { type NextRequest, NextResponse } from "next/server"
import { verifyMFAChallenge } from "@/lib/moodle-auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { challengeId, code } = body

    const isValid = await verifyMFAChallenge(challengeId, code)

    if (isValid) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ success: false, error: "Invalid MFA code" }, { status: 401 })
    }
  } catch (error) {
    console.error("MFA verification error:", error)
    return NextResponse.json({ success: false, error: "MFA verification failed" }, { status: 500 })
  }
}
