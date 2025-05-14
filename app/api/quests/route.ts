import { NextResponse } from "next/server"

// Mock quests database
const quests = [
  {
    id: "1",
    title: "Introduction to Algebra",
    description: "Complete the introductory algebra module and quiz",
    xp: 50,
    progress: 25,
    difficulty: "Easy",
    category: "Math",
    deadline: "2 days left",
    status: "in-progress",
  },
  {
    id: "2",
    title: "Literary Analysis Essay",
    description: "Write a 500-word analysis of 'To Kill a Mockingbird'",
    xp: 100,
    progress: 0,
    difficulty: "Medium",
    category: "English",
    deadline: "5 days left",
    status: "not-started",
  },
  // More quests...
]

export async function GET(request: Request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    // Filter quests by status if provided
    const filteredQuests = status ? quests.filter((quest) => quest.status === status) : quests

    return NextResponse.json({ success: true, quests: filteredQuests })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { questId, progress } = body

    // Find the quest
    const questIndex = quests.findIndex((q) => q.id === questId)
    if (questIndex === -1) {
      return NextResponse.json({ success: false, error: "Quest not found" }, { status: 404 })
    }

    // Update quest progress
    quests[questIndex].progress = progress

    // Update status based on progress
    if (progress === 0) {
      quests[questIndex].status = "not-started"
    } else if (progress === 100) {
      quests[questIndex].status = "completed"
    } else {
      quests[questIndex].status = "in-progress"
    }

    return NextResponse.json({
      success: true,
      quest: quests[questIndex],
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
