"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SSETestingPanel } from "@/components/dev/sse-testing-panel";
import { QuestDemoControls } from "@/components/dashboard/quest-demo-controls";
import { useAuth } from "@/lib/auth-context";
import {
  ChevronRight,
  Settings,
  InfoIcon,
  LayersIcon,
  BookOpen,
  Sparkles,
  HelpCircle,
  Award,
  Flag,
} from "lucide-react";
import Link from "next/link";

export default function DevDashboard() {
  const { user } = useAuth();
  const [isDev, setIsDev] = useState(false);

  useEffect(() => {
    setIsDev(process.env.NODE_ENV === "development");
  }, []);

  if (!isDev) {
    return (
      <div className="container mx-auto py-12">
        <Alert variant="destructive">
          <AlertTitle>Development Dashboard</AlertTitle>
          <AlertDescription>
            This page is only available in development mode.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-6 border-primary/20">
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            Development Dashboard
          </CardTitle>
          <CardDescription>
            Tools and shortcuts for development and testing
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Alert className="mb-6">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Development Mode Active</AlertTitle>
            <AlertDescription>
              Authentication is currently bypassed. You are automatically logged
              in as:
              <div className="mt-2 p-2 bg-muted rounded-md">
                <div className="font-mono text-sm">
                  Username: {user?.username || "dev-teacher"}
                  <br />
                  Role: {user?.role || "teacher"}
                  <br />
                  User ID: {user?.id || "1"}
                  <br />
                  Token: {user?.token?.substring(0, 10)}...
                </div>
              </div>
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <LayersIcon className="h-5 w-5 text-primary" />
                  Teacher Views
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-between"
                >
                  <Link href="/dashboard/teacher">
                    Teacher Dashboard
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-between"
                >
                  <Link href="/dashboard/teacher/quests">
                    Quest Management
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-between"
                >
                  <Link href="/dashboard/teacher/students">
                    Student Management
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Student Views
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-between"
                >
                  <Link href="/dashboard/quests">
                    Quest Browser
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-between"
                >
                  <Link href="/dashboard/profile">
                    Student Profile
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-between"
                >
                  <Link href="/dashboard/courses">
                    Courses
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Test Data Generation
            </h3>
            <QuestDemoControls
              onDemoDataCreated={() => {
                console.log("Demo data created");
              }}
            />
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Real-time Notifications Testing
            </h3>
            <SSETestingPanel />
          </div>

          <div className="flex justify-between items-center border-t pt-4 mt-6">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Note:</span> To restore
              authentication, revert changes in:
              <ul className="list-disc pl-5 mt-1">
                <li>backend/app/utils/auth.py</li>
                <li>frontend/lib/auth-context.tsx</li>
              </ul>
            </div>
            <Button variant="default" size="sm" asChild>
              <Link href="/">
                Back to Home
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
