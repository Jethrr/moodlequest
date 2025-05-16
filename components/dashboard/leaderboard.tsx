"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { LeaderboardUser } from "@/types/gamification"

// Mock data for leaderboard
const weeklyLeaders: LeaderboardUser[] = [
	{
		id: 1,
		name: "Alex Johnson",
		avatar: "/placeholder.svg?height=40&width=40",
		xp: 450,
		level: 8,
		badges: 12,
		rank: 1,
	},
	{
		id: 2,
		name: "Maria Garcia",
		avatar: "/placeholder.svg?height=40&width=40",
		xp: 420,
		level: 7,
		badges: 10,
		rank: 2,
	},
	{ id: 3, name: "James Wilson", avatar: "/placeholder.svg?height=40&width=40", xp: 380, level: 7, badges: 9, rank: 3 },
	{ id: 4, name: "Sarah Lee", avatar: "/placeholder.svg?height=40&width=40", xp: 350, level: 6, badges: 8, rank: 4 },
	{ id: 5, name: "David Chen", avatar: "/placeholder.svg?height=40&width=40", xp: 320, level: 6, badges: 7, rank: 5 },
	{ id: 6, name: "Emma Davis", avatar: "/placeholder.svg?height=40&width=40", xp: 290, level: 5, badges: 6, rank: 6 },
	{
		id: 7,
		name: "Michael Brown",
		avatar: "/placeholder.svg?height=40&width=40",
		xp: 260,
		level: 5,
		badges: 5,
		rank: 7,
	},
	{
		id: 8,
		name: "Sophia Martinez",
		avatar: "/placeholder.svg?height=40&width=40",
		xp: 230,
		level: 4,
		badges: 5,
		rank: 8,
	},
	{
		id: 9,
		name: "Daniel Taylor",
		avatar: "/placeholder.svg?height=40&width=40",
		xp: 200,
		level: 4,
		badges: 4,
		rank: 9,
	},
	{
		id: 10,
		name: "Olivia Anderson",
		avatar: "/placeholder.svg?height=40&width=40",
		xp: 180,
		level: 3,
		badges: 3,
		rank: 10,
	},
]

const allTimeLeaders: LeaderboardUser[] = [
	{
		id: 1,
		name: "Maria Garcia",
		avatar: "/placeholder.svg?height=40&width=40",
		xp: 12500,
		level: 25,
		badges: 48,
		rank: 1,
	},
	{
		id: 2,
		name: "James Wilson",
		avatar: "/placeholder.svg?height=40&width=40",
		xp: 11800,
		level: 24,
		badges: 45,
		rank: 2,
	},
	{
		id: 3,
		name: "Alex Johnson",
		avatar: "/placeholder.svg?height=40&width=40",
		xp: 10900,
		level: 22,
		badges: 42,
		rank: 3,
	},
	{
		id: 4,
		name: "Emma Davis",
		avatar: "/placeholder.svg?height=40&width=40",
		xp: 9500,
		level: 20,
		badges: 38,
		rank: 4,
	},
	{
		id: 5,
		name: "David Chen",
		avatar: "/placeholder.svg?height=40&width=40",
		xp: 8800,
		level: 18,
		badges: 35,
		rank: 5,
	},
	{ id: 6, name: "Sarah Lee", avatar: "/placeholder.svg?height=40&width=40", xp: 8200, level: 17, badges: 32, rank: 6 },
	{
		id: 7,
		name: "Michael Brown",
		avatar: "/placeholder.svg?height=40&width=40",
		xp: 7600,
		level: 16,
		badges: 30,
		rank: 7,
	},
	{
		id: 8,
		name: "Sophia Martinez",
		avatar: "/placeholder.svg?height=40&width=40",
		xp: 7100,
		level: 15,
		badges: 28,
		rank: 8,
	},
	{
		id: 9,
		name: "Daniel Taylor",
		avatar: "/placeholder.svg?height=40&width=40",
		xp: 6500,
		level: 14,
		badges: 25,
		rank: 9,
	},
	{
		id: 10,
		name: "Olivia Anderson",
		avatar: "/placeholder.svg?height=40&width=40",
		xp: 6000,
		level: 13,
		badges: 23,
		rank: 10,
	},
]

export function Leaderboard() {
	const [activeTab, setActiveTab] = useState<"weekly" | "alltime">("weekly")

	const currentUser = { id: 4, name: "Sarah Lee", rank: 4 } // Mock current user

	// Function to get trophy or medal for top 3 ranks
	const getRankIcon = (rank: number) => {
		if (rank === 1) {
			return (
				<div className="absolute -top-1 -left-1 w-6 h-6 flex items-center justify-center bg-yellow-400 rounded-full text-white">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="h-3.5 w-3.5"
					>
						<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
						<path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
						<path d="M4 22h16" />
						<path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
						<path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
						<path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
					</svg>
				</div>
			)
		} else if (rank === 2) {
			return (
				<div className="absolute -top-1 -left-1 w-6 h-6 flex items-center justify-center bg-gray-300 rounded-full text-white">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="h-3.5 w-3.5"
					>
						<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
						<path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
						<path d="M4 22h16" />
						<path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
						<path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
						<path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
					</svg>
				</div>
			)
		} else if (rank === 3) {
			return (
				<div className="absolute -top-1 -left-1 w-6 h-6 flex items-center justify-center bg-amber-600 rounded-full text-white">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="h-3.5 w-3.5"
					>
						<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
						<path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
						<path d="M4 22h16" />
						<path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
						<path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
						<path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
					</svg>
				</div>
			)
		}
		return null
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-2">
				<h2 className="text-3xl font-bold tracking-tight text-purple-800">Leaderboard</h2>
				<p className="text-muted-foreground">See how you rank against other learners in the MoodleQuest community.</p>
			</div>

			<Card className="overflow-hidden border-none shadow-sm bg-transparent">
				<CardContent className="p-0">
					<div className="bg-purple-50/70 p-4 rounded-t-xl">
						<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
							<div className="flex items-center gap-3">
								<div className="relative">
									<Avatar className="h-14 w-14 border-2 border-purple-200">
										<AvatarImage src="/placeholder.svg?height=56&width=56" alt={currentUser.name} />
										<AvatarFallback className="bg-purple-100 text-purple-700 text-lg">
											{currentUser.name.charAt(0)}
										</AvatarFallback>
									</Avatar>
									<div className="absolute -bottom-1 -right-1 w-6 h-6 flex items-center justify-center bg-purple-100 rounded-full border-2 border-white">
										<span className="text-xs font-semibold text-purple-700">#{currentUser.rank}</span>
									</div>
								</div>
								<div>
									<h3 className="font-bold text-lg text-purple-900">{currentUser.name}</h3>
									<p className="text-sm text-purple-700">Your Current Rank</p>
								</div>
							</div>
						</div>
					</div>

					<Tabs
						defaultValue="weekly"
						value={activeTab}
						onValueChange={(value) => setActiveTab(value as "weekly" | "alltime")}
						className="w-full"
					>
						<div className="px-4 py-2 bg-purple-50/70">
							<div className="flex justify-end">
								<TabsList className="bg-white border border-purple-100 p-1">
									<TabsTrigger
										value="weekly"
										className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
									>
										This Week
									</TabsTrigger>
									<TabsTrigger
										value="alltime"
										className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
									>
										All Time
									</TabsTrigger>
								</TabsList>
							</div>
						</div>

						<TabsContent value="weekly" className="mt-0 border-0 p-0">
							<div className="rounded-b-xl overflow-hidden bg-white">
								<div className="p-3 bg-purple-800 text-white flex items-center text-sm font-medium">
									<div className="w-14 text-center">Rank</div>
									<div className="flex-1 pl-2">Learner</div>
									<div className="w-20 text-center">Level</div>
									<div className="w-20 text-center">Badges</div>
									<div className="w-28 text-center">XP</div>
								</div>
								<div className="divide-y divide-gray-100">
									{weeklyLeaders.map((leader) => (
										<div
											key={leader.id}
											className={cn(
												"flex items-center p-3",
												leader.id === currentUser.id ? "bg-purple-50" : "hover:bg-gray-50",
												leader.rank <= 3 && "relative"
											)}
										>
											{getRankIcon(leader.rank)}
											<div className="w-14 flex justify-center">
												<span
													className={cn(
														"font-bold text-lg flex items-center justify-center w-8 h-8",
														leader.rank === 1
															? "text-yellow-500"
															: leader.rank === 2
															? "text-gray-400"
															: leader.rank === 3
															? "text-amber-600"
															: "text-gray-600"
													)}
												>
													{leader.rank}
												</span>
											</div>
											<div className="flex-1 flex items-center gap-3">
												<Avatar
													className={cn(
														"h-10 w-10 border",
														leader.rank === 1
															? "border-yellow-400"
															: leader.rank === 2
															? "border-gray-300"
															: leader.rank === 3
															? "border-amber-600"
															: "border-purple-100"
													)}
												>
													<AvatarImage src={leader.avatar || "/placeholder.svg"} alt={leader.name} />
													<AvatarFallback
														className={cn(
															leader.id === currentUser.id
																? "bg-purple-500 text-white"
																: "bg-gray-100 text-gray-700"
														)}
													>
														{leader.name.charAt(0)}
													</AvatarFallback>
												</Avatar>
												<div>
													<div
														className={cn(
															"font-medium",
															leader.id === currentUser.id && "text-purple-900"
														)}
													>
														{leader.name}
													</div>
													{leader.id === currentUser.id && (
														<Badge
															variant="outline"
															className="bg-purple-100 border-0 text-purple-700 text-xs"
														>
															You
														</Badge>
													)}
												</div>
											</div>
											<div className="w-20 text-center">
												<Badge className="bg-purple-100 hover:bg-purple-100 text-purple-700 border-0">
													Lvl {leader.level}
												</Badge>
											</div>
											<div className="w-20 text-center flex justify-center">
												<div className="flex items-center gap-1 text-xs">
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
														className="h-4 w-4 text-purple-500"
													>
														<path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.11" />
														<path d="M15 7a3 3 0 1 0-6 0c0 1.66.5 3 2 5h2c1.5-2 2-3.34 2-5Z" />
													</svg>
													<span>{leader.badges}</span>
												</div>
											</div>
											<div className="w-28 text-center">
												<div className="flex items-center justify-center gap-1 font-medium">
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
														className="h-4 w-4 text-[#F88379]"
													>
														<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
													</svg>
													<span
														className={cn(
															leader.rank <= 3 && "font-bold",
															leader.rank === 1 && "text-yellow-500",
															leader.rank === 2 && "text-gray-600",
															leader.rank === 3 && "text-amber-600"
														)}
													>
														{leader.xp.toLocaleString()} XP
													</span>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						</TabsContent>

						<TabsContent value="alltime" className="mt-0 border-0 p-0">
							<div className="rounded-b-xl overflow-hidden bg-white">
								<div className="p-3 bg-purple-800 text-white flex items-center text-sm font-medium">
									<div className="w-14 text-center">Rank</div>
									<div className="flex-1 pl-2">Learner</div>
									<div className="w-20 text-center">Level</div>
									<div className="w-20 text-center">Badges</div>
									<div className="w-28 text-center">XP</div>
								</div>
								<div className="divide-y divide-gray-100">
									{allTimeLeaders.map((leader) => (
										<div
											key={leader.id}
											className={cn(
												"flex items-center p-3",
												leader.id === currentUser.id ? "bg-purple-50" : "hover:bg-gray-50",
												leader.rank <= 3 && "relative"
											)}
										>
											{getRankIcon(leader.rank)}
											<div className="w-14 flex justify-center">
												<span
													className={cn(
														"font-bold text-lg flex items-center justify-center w-8 h-8",
														leader.rank === 1
															? "text-yellow-500"
															: leader.rank === 2
															? "text-gray-400"
															: leader.rank === 3
															? "text-amber-600"
															: "text-gray-600"
													)}
												>
													{leader.rank}
												</span>
											</div>
											<div className="flex-1 flex items-center gap-3">
												<Avatar
													className={cn(
														"h-10 w-10 border",
														leader.rank === 1
															? "border-yellow-400"
															: leader.rank === 2
															? "border-gray-300"
															: leader.rank === 3
															? "border-amber-600"
															: "border-purple-100"
													)}
												>
													<AvatarImage src={leader.avatar || "/placeholder.svg"} alt={leader.name} />
													<AvatarFallback
														className={cn(
															leader.id === currentUser.id
																? "bg-purple-500 text-white"
																: "bg-gray-100 text-gray-700"
														)}
													>
														{leader.name.charAt(0)}
													</AvatarFallback>
												</Avatar>
												<div>
													<div
														className={cn(
															"font-medium",
															leader.id === currentUser.id && "text-purple-900"
														)}
													>
														{leader.name}
													</div>
													{leader.id === currentUser.id && (
														<Badge
															variant="outline"
															className="bg-purple-100 border-0 text-purple-700 text-xs"
														>
															You
														</Badge>
													)}
												</div>
											</div>
											<div className="w-20 text-center">
												<Badge className="bg-purple-100 hover:bg-purple-100 text-purple-700 border-0">
													Lvl {leader.level}
												</Badge>
											</div>
											<div className="w-20 text-center flex justify-center">
												<div className="flex items-center gap-1 text-xs">
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
														className="h-4 w-4 text-purple-500"
													>
														<path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.11" />
														<path d="M15 7a3 3 0 1 0-6 0c0 1.66.5 3 2 5h2c1.5-2 2-3.34 2-5Z" />
													</svg>
													<span>{leader.badges}</span>
												</div>
											</div>
											<div className="w-28 text-center">
												<div className="flex items-center justify-center gap-1 font-medium">
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
														className="h-4 w-4 text-[#F88379]"
													>
														<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
													</svg>
													<span
														className={cn(
															leader.rank <= 3 && "font-bold",
															leader.rank === 1 && "text-yellow-500",
															leader.rank === 2 && "text-gray-600",
															leader.rank === 3 && "text-amber-600"
														)}
													>
														{leader.xp.toLocaleString()} XP
													</span>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	)
}
