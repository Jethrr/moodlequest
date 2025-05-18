import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password, service } = body

    // Forward the request to our backend
    const response = await fetch(`${API_BASE_URL}/auth/moodle/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Origin": request.headers.get("origin") || "http://localhost:3000"
      },
      credentials: "include",
      body: JSON.stringify({
        username,
        password,
        service
      }),
      cache: "no-cache"
    })

    if (!response.ok) {
      console.error(`Backend API error: ${response.status} ${response.statusText}`)
      const text = await response.text()
      try {
        // Try to parse as JSON
        const data = JSON.parse(text)
        return NextResponse.json(data, { status: response.status })
      } catch {
        // If not JSON, return the text
        return NextResponse.json({ 
          success: false, 
          error: `Backend API error: ${text || response.statusText}` 
        }, { status: response.status })
      }
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Authentication error:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Authentication failed. Please check your credentials or try again later." 
    }, { status: 500 })
  }
} 