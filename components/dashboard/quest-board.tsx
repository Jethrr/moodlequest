"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { QuestModal } from "@/components/dashboard/quest-modal"
import { cn } from "@/lib/utils"
import { Quest } from "@/types/gamification"

// Mock data for quests
const quests: Quest[] = [
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
	{
		id: "3",
		title: "Chemical Reactions Lab",
		description: "Complete the virtual lab on chemical reactions and submit your findings",
		xp: 75,
		progress: 100,
		difficulty: "Medium",
		category: "Science",
		deadline: "Completed",
		status: "completed",
	},
	{
		id: "4",
		title: "World War II Timeline",
		description: "Create a detailed timeline of major World War II events",
		xp: 120,
		progress: 60,
		difficulty: "Hard",
		category: "History",
		deadline: "1 day left",
		status: "in-progress",
	},
	{
		id: "5",
		title: "Spanish Conversation Practice",
		description: "Record a 3-minute conversation in Spanish with a classmate",
		xp: 80,
		progress: 0,
		difficulty: "Medium",
		category: "Languages",
		deadline: "3 days left",
		status: "not-started",
	},
	{
		id: "6",
		title: "Programming Basics Quiz",
		description: "Complete the quiz on programming fundamentals",
		xp: 60,
		progress: 100,
		difficulty: "Easy",
		category: "Computer Science",
		deadline: "Completed",
		status: "completed",
	},
]

export function QuestBoard() {
	const [activeTab, setActiveTab] = useState<"all" | "not-started" | "in-progress" | "completed">("all")
	const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null)
	const [isModalOpen, setIsModalOpen] = useState(false)

	const filteredQuests = activeTab === "all" ? quests : quests.filter((quest) => quest.status === activeTab)

	const openQuestModal = (quest: Quest) => {
		setSelectedQuest(quest)
		setIsModalOpen(true)
	}

	// Get appropriate category icon
	const getCategoryIcon = (category: string) => {
		switch (category.toLowerCase()) {
			case "math":
				return (
					<svg
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
						<path d="M14 13h6m-3-3v6M7 21l5-5m-5 0l5 5" />
					</svg>
				)
			case "english":
				return (
					<svg
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
						<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
					</svg>
				)
			case "science":
				return (
					<svg
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
						<path d="M10 2v8.5a2.5 2.5 0 0 1-5 0V2" />
						<path d="M7 2v8.5a2.5 2.5 0 0 0 5 0V2" />
						<path d="M9 2v8.5a2.5 2.5 0 0 0 5 0V2" />
						<path d="M12 2v8.5a2.5 2.5 0 0 1-5 0V2" />
						<path d="M14 12.75V21a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-8.25" />
						<path d="M3 2h18v4H3z" />
					</svg>
				)
			case "history":
				return (
					<svg
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
						<path d="M12 8v4l3 3" />
						<circle cx="12" cy="12" r="10" />
					</svg>
				)
			case "languages":
				return (
					<svg
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
						<path d="m5 8 6 6" />
						<path d="m4 14 6-6 2-3" />
						<path d="M2 5h12" />
						<path d="M7 2h1" />
						<path d="m22 22-5-10-5 10" />
						<path d="M14 18h6" />
					</svg>
				)
			case "computer science":
				return (
					<svg
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
						<rect width="18" height="12" x="3" y="4" rx="2" ry="2" />
						<line x1="2" x2="22" y1="20" y2="20" />
					</svg>
				)
			default:
				return (
					<svg
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
				)
		}
	}

	const getStatusText = (status: Quest["status"], progress: number) => {
		if (status === "completed") return "View Details"
		if (status === "in-progress") return "Continue Quest"
		return "Start Quest"
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-2">
				<h2 className="text-3xl font-bold tracking-tight text-purple-800">Quest Board</h2>
				<p className="text-muted-foreground">
					Complete quests to earn XP and level up your learning journey.
				</p>
			</div>

			<Tabs
				defaultValue="all"
				value={activeTab}
				onValueChange={(value) => setActiveTab(value as typeof activeTab)}
				className="w-full"
			>
				<TabsList className="bg-purple-50 p-1">
					<TabsTrigger
						value="all"
						className="data-[state=active]:bg-white data-[state=active]:text-purple-700"
					>
						All Quests
					</TabsTrigger>
					<TabsTrigger
						value="not-started"
						className="data-[state=active]:bg-white data-[state=active]:text-purple-700"
					>
						Not Started
					</TabsTrigger>
					<TabsTrigger
						value="in-progress"
						className="data-[state=active]:bg-white data-[state=active]:text-purple-700"
					>
						In Progress
					</TabsTrigger>
					<TabsTrigger
						value="completed"
						className="data-[state=active]:bg-white data-[state=active]:text-purple-700"
					>
						Completed
					</TabsTrigger>
				</TabsList>
				<TabsContent value={activeTab} className="mt-6">
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{filteredQuests.map((quest) => (
							<Card
								key={quest.id}
								className={cn(
									"overflow-hidden border transition-all hover:border-purple-200 hover:shadow-sm",
									quest.status === "completed" && "bg-purple-50/30"
								)}
							>
								<CardHeader className="pb-3 relative">
									<div className="flex items-center justify-between mb-1">
										<div className="flex items-center gap-2">
											<div className="text-purple-500">
												{getCategoryIcon(quest.category)}
											</div>
											<span className="text-xs font-medium text-purple-600">
												{quest.category}
											</span>
										</div>
										<Badge
											variant="outline"
											className={cn(
												"text-xs font-normal",
												quest.difficulty === "Easy"
													? "border-green-200 bg-green-50 text-green-700"
													: quest.difficulty === "Medium"
													? "border-purple-200 bg-purple-50 text-purple-700"
													: "border-[#F88379] bg-red-50 text-[#F88379]"
											)}
										>
											{quest.difficulty}
										</Badge>
									</div>
									<CardTitle className="text-base font-medium text-purple-900">
										{quest.title}
									</CardTitle>
									<CardDescription className="line-clamp-2 text-sm">
										{quest.description}
									</CardDescription>
								</CardHeader>
								<CardContent className="pb-3">
									<div className="space-y-3">
										<div className="flex justify-between text-xs">
											<div className="flex items-center">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="24"
													height="24"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="2"
													strokeLinecap="round"
													strokeLinejoin="round"
													className="h-4 w-4 mr-1 text-[#F88379]"
												>
													<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
												</svg>
												<span className="font-medium">{quest.xp} XP</span>
											</div>
											<Badge
												variant="outline"
												className={cn(
													"text-xs font-normal border-0 bg-transparent",
													quest.deadline.includes("1 day")
														? "text-[#F88379]"
														: "text-muted-foreground"
												)}
											>
												{quest.deadline}
											</Badge>
										</div>
										<div className="space-y-1.5">
											<div className="flex justify-between items-center">
												<span className="text-xs text-muted-foreground">
													Progress
												</span>
												<span className="text-xs font-medium">
													{quest.progress}%
												</span>
											</div>
											<div className="relative h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
												<div
													className={cn(
														"absolute h-1.5 left-0 top-0 rounded-full",
														quest.status === "completed"
															? "bg-green-500"
															: "bg-purple-500"
													)}
													style={{ width: `${quest.progress}%` }}
												/>
											</div>
										</div>
									</div>
								</CardContent>
								<CardFooter className="pt-1">
									<Button
										variant={quest.status === "completed" ? "outline" : "default"}
										className={cn(
											"w-full rounded-md text-sm h-9",
											quest.status === "completed"
												? "border-purple-200 text-purple-700 hover:bg-purple-50"
												: "bg-purple-600 text-white hover:bg-purple-700"
										)}
										onClick={() => openQuestModal(quest)}
									>
										{getStatusText(quest.status, quest.progress)}
									</Button>
								</CardFooter>
							</Card>
						))}
					</div>
				</TabsContent>
			</Tabs>

			{isModalOpen && selectedQuest && (
				<QuestModal
					quest={selectedQuest}
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
				/>
			)}
		</div>
	)
}
