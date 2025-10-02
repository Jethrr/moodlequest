"use client";

import { useParams, useSearchParams } from "next/navigation";
import React from "react";
import { QuestAnalyticsDashboard } from "@/components/dashboard/teacher/quest-analytics-dashboard";

export default function QuestAnalyticsPage() {
  const params = useParams();
  const questIdParam = params?.questId as string;
  const questId = Number(questIdParam);

  if (!questId || Number.isNaN(questId)) {
    return (
      <div className="p-6">
        <p className="text-red-600">Invalid quest id.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto p-6">
        <QuestAnalyticsDashboard questId={questId} />
      </div>
    </div>
  );
}


