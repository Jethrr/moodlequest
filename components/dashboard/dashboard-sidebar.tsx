import Link from "next/link"

export function DashboardSidebar() {  return (    <aside className="hidden md:flex w-64 flex-col border-r border-purple-100 bg-white shadow-sm bg-gradient-to-b from-purple-100/60 via-purple-50/40 to-white">
      <div className="flex flex-col gap-4 p-6">
        
        
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors text-purple-700 hover:bg-purple-100/60 hover:text-purple-900"
        >          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 text-purple-500"
          >
            <rect width="7" height="9" x="3" y="3" rx="1" />
            <rect width="7" height="5" x="14" y="3" rx="1" />
            <rect width="7" height="9" x="14" y="12" rx="1" />
            <rect width="7" height="5" x="3" y="16" rx="1" />
          </svg>
          Dashboard
        </Link>
        <Link
          href="/dashboard/quests"
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors text-gray-600 hover:bg-purple-100/60 hover:text-purple-900"
        >          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
          </svg>
          Quests
        </Link>
        <Link
          href="/dashboard/achievements"
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors text-gray-600 hover:bg-purple-100/60 hover:text-purple-900"
        >          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.11" />
            <path d="M15 7a3 3 0 1 0-6 0c0 1.66.5 3 2 5h2c1.5-2 2-3.34 2-5Z" />
          </svg>
          Achievements
        </Link>
        <Link
          href="/dashboard/leaderboard"
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors text-gray-600 hover:bg-purple-100/60 hover:text-purple-900"
        >          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M15 8h.01" />
            <path d="M9 8h.01" />
            <path d="M15 16h.01" />
            <path d="M9 16h.01" />
            <path d="M9 12h6" />
          </svg>
          Leaderboard
        </Link>
        <Link
          href="/dashboard/progress"
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors text-gray-600 hover:bg-purple-100/60 hover:text-purple-900"
        >          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
          Progress
        </Link>
        
        
      </div>
    </aside>
  )
}
