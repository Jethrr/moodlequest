import { NextResponse } from "next/server"

// Mock user database
const users = [
  {
    id: "1",
    name: "Demo User",
    email: "user@example.com",
    password: "password123", // In a real app, this would be hashed
  },
]

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, email, password, name } = body

    // Handle sign in
    if (action === "signin") {
      const user = users.find((u) => u.email === email)

      if (!user || user.password !== password) {
        return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 })
      }

      // In a real app, you would create a session or JWT token here
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      })
    }

    // Handle registration
    if (action === "register") {
      // Check if user already exists
      const existingUser = users.find((u) => u.email === email)
      if (existingUser) {
        return NextResponse.json({ success: false, error: "User already exists" }, { status: 400 })
      }

      // Create new user
      const newUser = {
        id: (users.length + 1).toString(),
        name,
        email,
        password,
      }

      users.push(newUser)

      // In a real app, you would create a session or JWT token here
      return NextResponse.json({
        success: true,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
      })
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
