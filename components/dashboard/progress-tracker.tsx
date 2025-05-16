"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, AreaChart, Area } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

// Mock data for progress tracking
const weeklyData = [
	{ day: "Mon", xp: 50, quests: 2 },
	{ day: "Tue", xp: 80, quests: 3 },
	{ day: "Wed", xp: 40, quests: 1 },
	{ day: "Thu", xp: 120, quests: 4 },
	{ day: "Fri", xp: 60, quests: 2 },
	{ day: "Sat", xp: 30, quests: 1 },
	{ day: "Sun", xp: 90, quests: 3 },
]

const monthlyData = [
	{ week: "Week 1", xp: 350, quests: 12 },
	{ week: "Week 2", xp: 420, quests: 15 },
	{ week: "Week 3", xp: 280, quests: 10 },
	{ week: "Week 4", xp: 390, quests: 14 },
]

const subjectProgress = [
	{ subject: "Math", progress: 75, total: 20, completed: 15, icon: "➗" },
	{ subject: "Science", progress: 60, total: 18, completed: 11, icon: "🧪" },
	{ subject: "English", progress: 90, total: 15, completed: 13, icon: "📚" },
	{ subject: "History", progress: 40, total: 12, completed: 5, icon: "🏛️" },
	{ subject: "Computer Science", progress: 85, total: 10, completed: 8, icon: "💻" },
]

export function ProgressTracker() {
	return (
		<div className="space-y-8">
			<div className="flex flex-col gap-2">
				<h2 className="text-3xl font-bold tracking-tight text-purple-800">Progress Tracker</h2>
				<p className="text-muted-foreground">Monitor your learning journey and track your achievements over time.</p>
			</div>

			<div className="grid gap-6 md:grid-cols-3">
				<Card className="border-none shadow-sm overflow-hidden">
					<div className="bg-purple-50 px-6 py-4">
						<CardTitle className="text-lg text-purple-800">Total XP</CardTitle>
						<CardDescription>Experience points earned</CardDescription>
					</div>
					<CardContent className="p-6">
						<div className="flex items-center gap-2">
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
								className="text-[#F88379]"
							>
								<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
							</svg>
							<span className="text-3xl font-bold">1,450 XP</span>
						</div>
					</CardContent>
				</Card>
				<Card className="border-none shadow-sm overflow-hidden">
					<div className="bg-purple-50 px-6 py-4">
						<CardTitle className="text-lg text-purple-800">Quests Completed</CardTitle>
						<CardDescription>Total learning missions</CardDescription>
					</div>
					<CardContent className="p-6">
						<div className="flex items-center gap-2">
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
								className="text-purple-600"
							>
								<path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z"></path>
								<path d="M8 12h8"></path>
								<path d="M12 16V8"></path>
							</svg>
							<span className="text-3xl font-bold">52 / 78</span>
						</div>
					</CardContent>
				</Card>
				<Card className="border-none shadow-sm overflow-hidden">
					<div className="bg-purple-50 px-6 py-4">
						<CardTitle className="text-lg text-purple-800">Current Level</CardTitle>
						<CardDescription>Your learning rank</CardDescription>
					</div>
					<CardContent className="p-6">
						<div className="flex items-center gap-2 mb-4">
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
								className="text-purple-600"
							>
								<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
								<path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
								<path d="M4 22h16"></path>
								<path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
								<path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
								<path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
							</svg>
							<span className="text-3xl font-bold">Level 5</span>
						</div>
						<div className="space-y-2">
							<div className="flex justify-between text-xs font-medium">
								<span className="text-purple-700">Progress to Level 6</span>
								<span className="text-[#F88379]">450/600 XP</span>
							</div>							<Progress value={75} className="h-2.5 bg-purple-100" />
						</div>
					</CardContent>
				</Card>
			</div>

			<Tabs defaultValue="weekly" className="mt-8">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
					<h3 className="text-xl font-bold text-purple-800">Activity Overview</h3>
					<TabsList className="bg-white border border-purple-100 p-1">
						<TabsTrigger
							value="weekly"
							className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
						>
							Weekly
						</TabsTrigger>
						<TabsTrigger
							value="monthly"
							className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
						>
							Monthly
						</TabsTrigger>
					</TabsList>
				</div>

				<TabsContent value="weekly" className="mt-0">
					<Card className="border-none shadow-sm overflow-hidden">
						<CardContent className="p-6">
							<ChartContainer
								config={{
									xp: {
										label: "XP Earned",
										color: "#F88379",
									},
									quests: {
										label: "Quests Completed",
										color: "hsl(271, 70%, 60%)",
									},
								}}
								className="h-[300px]"
							>
								<ResponsiveContainer width="100%" height="100%">
									<AreaChart data={weeklyData}>
										<defs>
											<linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
												<stop offset="5%" stopColor="#F88379" stopOpacity={0.1} />
												<stop offset="95%" stopColor="#F88379" stopOpacity={0.0} />
											</linearGradient>
											<linearGradient id="colorQuests" x1="0" y1="0" x2="0" y2="1">
												<stop offset="5%" stopColor="hsl(271, 70%, 60%)" stopOpacity={0.1} />
												<stop offset="95%" stopColor="hsl(271, 70%, 60%)" stopOpacity={0.0} />
											</linearGradient>
										</defs>
										<CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
										<XAxis dataKey="day" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
										<YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
										<ChartTooltip content={<ChartTooltipContent />} />
										<Legend />
										<Area
											type="monotone"
											dataKey="xp"
											name="XP Earned"
											stroke="#F88379"
											strokeWidth={2}
											fillOpacity={1}
											fill="url(#colorXp)"
										/>
										<Area
											type="monotone"
											dataKey="quests"
											name="Quests Completed"
											stroke="hsl(271, 70%, 60%)"
											strokeWidth={2}
											fillOpacity={1}
											fill="url(#colorQuests)"
										/>
									</AreaChart>
								</ResponsiveContainer>
							</ChartContainer>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="monthly" className="mt-0">
					<Card className="border-none shadow-sm overflow-hidden">
						<CardContent className="p-6">
							<ChartContainer
								config={{
									xp: {
										label: "XP Earned",
										color: "#F88379",
									},
									quests: {
										label: "Quests Completed",
										color: "hsl(271, 70%, 60%)",
									},
								}}
								className="h-[300px]"
							>
								<ResponsiveContainer width="100%" height="100%">
									<AreaChart data={monthlyData}>
										<defs>
											<linearGradient id="colorXpMonthly" x1="0" y1="0" x2="0" y2="1">
												<stop offset="5%" stopColor="#F88379" stopOpacity={0.1} />
												<stop offset="95%" stopColor="#F88379" stopOpacity={0.0} />
											</linearGradient>
											<linearGradient id="colorQuestsMonthly" x1="0" y1="0" x2="0" y2="1">
												<stop offset="5%" stopColor="hsl(271, 70%, 60%)" stopOpacity={0.1} />
												<stop offset="95%" stopColor="hsl(271, 70%, 60%)" stopOpacity={0.0} />
											</linearGradient>
										</defs>
										<CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
										<XAxis dataKey="week" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
										<YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
										<ChartTooltip content={<ChartTooltipContent />} />
										<Legend />
										<Area
											type="monotone"
											dataKey="xp"
											name="XP Earned"
											stroke="#F88379"
											strokeWidth={2}
											fillOpacity={1}
											fill="url(#colorXpMonthly)"
										/>
										<Area
											type="monotone"
											dataKey="quests"
											name="Quests Completed"
											stroke="hsl(271, 70%, 60%)"
											strokeWidth={2}
											fillOpacity={1}
											fill="url(#colorQuestsMonthly)"
										/>
									</AreaChart>
								</ResponsiveContainer>
							</ChartContainer>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			<div className="mt-8">
				<h3 className="text-xl font-bold text-purple-800 mb-6">Subject Progress</h3>
				<Card className="border-none shadow-sm">
					<CardContent className="p-6">
						<div className="space-y-6">
							{subjectProgress.map((subject) => {
								// Determine progress color based on percentage
								const progressColorClass =
									subject.progress >= 80
										? "bg-green-500"
										: subject.progress >= 60
										? "bg-[#F88379]"
										: subject.progress >= 40
										? "bg-amber-500"
										: "bg-red-500"

								return (									<div key={subject.subject} className="space-y-3 hover:bg-purple-50/50 p-3 rounded-lg transition-colors">
										<div className="flex justify-between items-center">
											<div className="flex items-center gap-3">
												<div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-lg shadow-sm">
													{subject.icon}
												</div>
												<div>
													<div className="font-medium text-purple-900">{subject.subject}</div>
													<div className="text-sm text-muted-foreground">
														{subject.completed} / {subject.total} quests completed
													</div>
												</div>
											</div>
											<Badge className="bg-purple-100 text-purple-700 border-0 font-medium">
												{subject.progress}%
											</Badge>
										</div>
										<div className="relative pt-1">
											<div className="overflow-hidden h-2.5 text-xs flex rounded-full bg-purple-100">
												<div
													style={{ width: `${subject.progress}%` }}
													className={`${progressColorClass} shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500`}
												></div>
											</div>
										</div>
									</div>
								)
							})}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
