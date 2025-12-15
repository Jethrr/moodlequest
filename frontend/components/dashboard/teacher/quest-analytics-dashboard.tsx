"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiClient } from '@/lib/api-client';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Activity, CheckCircle2, PlayCircle, RefreshCw, ChevronLeft } from 'lucide-react';

interface QuestAnalytics {
  quest_id: number;
  title: string;
  quest_type: string;
  difficulty_level: number;
  total_students: number;
  started_count: number;
  completed_count: number;
  start_rate: number;
  completion_rate: number;
  engagement_score: number;
  stage_breakdown: {
    [key: string]: {
      count: number;
      avg_score: number;
      avg_interactions: number;
    };
  };
}

interface StudentProgress {
  user_id: number;
  name: string;
  email: string;
  engagement_stage: string;
  engagement_score: number;
  interaction_count: number;
  progress_percent: number;
  started_at: string | null;
  completed_at: string | null;
  validated_at: string | null;
  first_interaction_at: string | null;
  last_interaction_at: string | null;
}

interface QuestAnalyticsDashboardProps {
  questId: number;
}

export function QuestAnalyticsDashboard({ questId }: QuestAnalyticsDashboardProps) {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<QuestAnalytics | null>(null);
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<'all' | 'not_started' | 'started' | 'completed'>('all');

  type TimeSeriesPoint = { date: string; activeParticipants: number; completions: number };
  const [series, setSeries] = useState<TimeSeriesPoint[]>([]);
  const [byHour, setByHour] = useState<number[]>([]);
  const [tiers, setTiers] = useState<{ high: number; medium: number; low: number } | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [questId, page, pageSize]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [analyticsResponse, studentsResponse, timeseriesResponse, heatmapResponse, tiersResponse] = await Promise.all([
        apiClient.request<{ success: boolean; data: QuestAnalytics }>(
          `/quest-analytics/quest/${questId}`
        ),
        apiClient.request<{ success: boolean; data: { students: StudentProgress[]; page: number; page_size: number; total: number } }>(
          `/quest-analytics/quest/${questId}/students?page=${page}&page_size=${pageSize}`
        ),
        apiClient.request<{ success: boolean; data: { series: TimeSeriesPoint[] } }>(
          `/quest-analytics/quest/${questId}/timeseries?days=14`
        ),
        apiClient.request<{ success: boolean; data: { byHour: number[] } }>(
          `/quest-analytics/quest/${questId}/heatmap`
        ),
        apiClient.request<{ success: boolean; data: { high: number; medium: number; low: number } }>(
          `/quest-analytics/quest/${questId}/tiers`
        )
      ]);

      if (analyticsResponse.success) {
        setAnalytics(analyticsResponse.data);
      }
      if (studentsResponse.success) {
        setStudents(studentsResponse.data.students);
        setPage(studentsResponse.data.page || page);
        setPageSize(studentsResponse.data.page_size || pageSize);
        setTotal(studentsResponse.data.total || 0);
      }
      if (timeseriesResponse.success) {
        setSeries(timeseriesResponse.data.series || []);
      }
      if (heatmapResponse.success) {
        setByHour(heatmapResponse.data.byHour || []);
      }
      if (tiersResponse.success) {
        setTiers(tiersResponse.data);
      }
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStageColor = (stage: string) => {
    return STAGE_COLORS[stage as keyof typeof STAGE_COLORS]?.dot || 'bg-gray-500';
  };

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case 'not_started': return 'Not Started';
      case 'started': return 'Started';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      default: return stage;
    }
  };

  const STAGE_COLORS = {
    not_started: { hex: '#6b7280', dot: 'bg-gray-500', pill: 'bg-gray-500 text-white border-gray-500' },
    started: { hex: '#3b82f6', dot: 'bg-blue-500', pill: 'bg-blue-600 text-white border-blue-600' },
    in_progress: { hex: '#f59e0b', dot: 'bg-yellow-500', pill: 'bg-yellow-500 text-black border-yellow-500' },
    completed: { hex: '#10b981', dot: 'bg-green-500', pill: 'bg-green-600 text-white border-green-600' },
  } as const;

  const getStagePillClasses = (stage: string) => {
    return STAGE_COLORS[stage as keyof typeof STAGE_COLORS]?.pill || 'bg-gray-500 text-white border-gray-500';
  };

  const getProgressStatus = (percent: number) => {
    if (percent >= 100) return 'completed';
    if (percent > 0) return 'started';
    return 'not_started';
  };

  const filteredStudents = useMemo(() => {
    if (statusFilter === 'all') return students;
    return students.filter((s) => getProgressStatus(s.progress_percent) === statusFilter);
  }, [students, statusFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error || 'Failed to load analytics'}</p>
        <Button onClick={fetchAnalytics} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quest Header */}
      <Card className="shadow-sm border border-gray-200 rounded-xl">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Button size="sm" variant="outline" onClick={() => router.back()}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <CardTitle className="truncate font-semibold tracking-tight">{analytics.title}</CardTitle>
            </div>
            <div className="flex gap-2 items-center flex-shrink-0">
              <Badge variant="outline">{analytics.quest_type}</Badge>
              <Button size="sm" variant="outline" onClick={fetchAnalytics}>
                <RefreshCw className="h-4 w-4 mr-2" /> Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white text-black shadow-sm border border-gray-200 rounded-xl">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-50 text-blue-600">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-700 leading-tight">{analytics.engagement_score}</div>
              <p className="text-xs text-gray-500">Engagement Score</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white text-black shadow-sm border border-gray-200 rounded-xl">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-50 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-700 leading-tight">{analytics.completion_rate}%</div>
              <p className="text-xs text-gray-500">Completion Rate</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white text-black shadow-sm border border-gray-200 rounded-xl">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-full bg-orange-50 text-orange-600">
              <PlayCircle className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-700 leading-tight">{analytics.start_rate}%</div>
              <p className="text-xs text-gray-500">Start Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Stages */}
      <Card className="bg-white text-black shadow-sm border border-gray-200 rounded-xl">
        <CardHeader>
          <CardTitle>Engagement Stages</CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const data = Object.entries(analytics.stage_breakdown).map(([stage, s]) => ({ name: getStageLabel(stage), value: s.count, key: stage }));
            return (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
                    {data.map((d, idx) => (
                      <Cell key={`cell-${idx}`} fill={(STAGE_COLORS as any)[d.key]?.hex || '#6b7280'} />
                    ))}
                  </Pie>
                  <Legend wrapperStyle={{ color: '#e5e7eb' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }}
                      itemStyle={{ color: '#f9fafb' }}
                      labelStyle={{ color: '#f9fafb' }}
                    />
                </PieChart>
              </ResponsiveContainer>
            );
          })()}
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="bg-white text-black shadow-sm border border-gray-200 rounded-xl">
        <CardHeader>
          <CardTitle>Engagement Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Activity Timeline (interactive) */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Activity (14 days)</p>
              <ChartContainer
                config={{
                  activeParticipants: { label: 'Active Participants', color: '#3b82f6' },
                  completions: { label: 'Completions', color: '#10b981' },
                }}
                className="h-[220px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={series}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#e5e7eb' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#e5e7eb' }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend wrapperStyle={{ color: '#e5e7eb' }} />
                    <Line type="monotone" dataKey="activeParticipants" name="Active" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="completions" name="Completed" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            {/* Peak Hours */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Peak Hours</p>
              <ChartContainer
                config={{ count: { label: 'Events', color: '#a78bfa' } }}
                className="h-[220px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byHour.map((v,i)=>({hour:i,count:v}))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="hour" tickFormatter={(v)=>`${v}:00`} tick={{ fontSize: 10, fill: '#e5e7eb' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#e5e7eb' }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="#a78bfa" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            {/* Tiers */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Engagement Levels</p>
              {(() => {
                const d = [
                  { name: 'High', value: tiers?.high ?? 0, color: '#10b981' },
                  { name: 'Medium', value: tiers?.medium ?? 0, color: '#f59e0b' },
                  { name: 'Low', value: tiers?.low ?? 0, color: '#ef4444' },
                ];
                return (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={d} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80}>
                        {d.map((it, idx)=>(<Cell key={idx} fill={it.color} />))}
                      </Pie>
                      <Legend wrapperStyle={{ color: '#e5e7eb' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }}
                        itemStyle={{ color: '#f9fafb' }}
                        labelStyle={{ color: '#f9fafb' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                );
              })()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Progress */}
      <Card className="bg-white text-black shadow-sm border border-gray-200 rounded-xl">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Student Progress</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status</span>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="started">Started</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredStudents.map((student) => (
              <div key={student.user_id} className="grid grid-cols-1 md:grid-cols-12 items-center gap-4 p-4 border rounded-lg hover:shadow-sm transition-shadow">
                {/* Left: identity */}
                <div className="md:col-span-5 flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStageColor(student.engagement_stage)}`}></div>
                  <div>
                    <p className="font-medium leading-tight">{student.name || student.email}</p>
                    <p className="text-sm text-gray-600">{student.email}</p>
                  </div>
                </div>

                {/* Middle: stats */}
                <div className="md:col-span-3 flex gap-6">
                  <div className="text-center">
                    <p className="text-base font-semibold">{student.engagement_score}</p>
                    <p className="text-xs text-gray-600">Score</p>
                  </div>
                  {/* <div className="text-center">
                    <p className="text-base font-semibold">{student.interaction_count}</p>
                    <p className="text-xs text-gray-600">Interactions</p>
                  </div> */}
                </div>

                {/* Right: progress + stage */}
                <div className="md:col-span-4 flex items-center gap-3">
                  <div className="w-full">
                    <Progress value={student.progress_percent} className="h-2" />
                    <p className="text-xs text-gray-600 mt-1">{student.progress_percent}%</p>
                  </div>
                  <Badge className={`whitespace-nowrap ${getStagePillClasses(student.engagement_stage)}`}>
                    {getStageLabel(student.engagement_stage)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">Page {page} of {Math.max(1, Math.ceil(total / (pageSize || 1)))}</div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={()=> setPage(Math.max(1, page-1))} disabled={page<=1}>Prev</Button>
              <Button variant="outline" size="sm" onClick={()=> setPage(page+1)} disabled={page >= Math.ceil(total / (pageSize || 1))}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
