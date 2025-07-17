/**
 * SSE Connection Debug Panel
 * Helps troubleshoot webhook notification issues
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSSENotifications } from "@/hooks/use-sse-notifications";
import { useCurrentUser } from "@/hooks/useCurrentMoodleUser";
import { useGlobalXPReward } from "@/contexts/xp-reward-context";
import {
  Wifi,
  WifiOff,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Bug,
  Zap,
  Activity,
} from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002/api";

interface ConnectionStatus {
  user: {
    id: number;
    username: string;
    moodle_user_id: number;
  };
  sse_connection: {
    user_id: number;
    is_connected: boolean;
    connection_count: number;
    total_connected_users: number;
    all_connected_users: number[];
  };
  notification_service: {
    total_active_connections: number;
    all_connected_users: number[];
  };
  recommendations: string[];
}

export function SSEConnectionDebugPanel() {
  const { user } = useCurrentUser();
  const { connectionState, reconnect } = useSSENotifications();
  const { triggerXPReward, isConnected: xpSystemConnected } =
    useGlobalXPReward();

  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [testingNotification, setTestingNotification] = useState(false);

  // Fetch connection status from backend
  const fetchConnectionStatus = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/webhooks/debug/notification-status/${user.id}`
      );
      if (response.ok) {
        const status = await response.json();
        setConnectionStatus(status);
      } else {
        console.error("Failed to fetch connection status");
      }
    } catch (error) {
      console.error("Error fetching connection status:", error);
    } finally {
      setLoading(false);
    }
  };

  // Test webhook notification
  const testWebhookNotification = async () => {
    if (!user?.id) return;

    setTestingNotification(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/webhooks/debug/test-notification/${user.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("Test notification result:", result);

        // Refresh status after test
        setTimeout(fetchConnectionStatus, 1000);
      } else {
        console.error("Failed to send test notification");
      }
    } catch (error) {
      console.error("Error sending test notification:", error);
    } finally {
      setTestingNotification(false);
    }
  };

  // Test XP reward popup directly
  const testXPPopup = () => {
    triggerXPReward(50, "Debug Test Quest Completed! 🎉", 1250, "debug_test");
  };

  // Auto-fetch status on mount and user change
  useEffect(() => {
    fetchConnectionStatus();
  }, [user?.id]);

  if (!user) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <p className="text-gray-500">Please log in to use the debug panel.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            SSE Connection Debug Panel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current User Info */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Current User</h3>
              <p className="text-sm text-gray-600">
                {user.username} (ID: {user.id}, Moodle ID: {user.moodle_user_id}
                )
              </p>
            </div>
            <Button
              onClick={fetchConnectionStatus}
              disabled={loading}
              size="sm"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh Status
            </Button>
          </div>

          {/* Frontend SSE Connection Status */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Frontend SSE Connection
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex items-center gap-2">
                {connectionState.isConnected ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">
                  {connectionState.isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {connectionState.isConnecting ? (
                  <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                ) : (
                  <Wifi className="h-4 w-4 text-gray-400" />
                )}
                <span className="text-sm">
                  {connectionState.isConnecting ? "Connecting..." : "Idle"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {xpSystemConnected ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">XP System</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm">
                  Last Heartbeat:{" "}
                  {connectionState.lastHeartbeat
                    ? connectionState.lastHeartbeat.toLocaleTimeString()
                    : "Never"}
                </span>
              </div>
            </div>

            {connectionState.error && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Connection Error: {connectionState.error}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Backend Connection Status */}
          {connectionStatus && (
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Backend SSE Status
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <span className="text-sm font-medium">User Connected:</span>
                  <Badge
                    variant={
                      connectionStatus.sse_connection.is_connected
                        ? "default"
                        : "destructive"
                    }
                    className="ml-2"
                  >
                    {connectionStatus.sse_connection.is_connected
                      ? "Yes"
                      : "No"}
                  </Badge>
                </div>

                <div>
                  <span className="text-sm font-medium">User Connections:</span>
                  <Badge variant="outline" className="ml-2">
                    {connectionStatus.sse_connection.connection_count}
                  </Badge>
                </div>

                <div>
                  <span className="text-sm font-medium">Total Connected:</span>
                  <Badge variant="outline" className="ml-2">
                    {
                      connectionStatus.notification_service
                        .total_active_connections
                    }
                  </Badge>
                </div>
              </div>

              {connectionStatus.notification_service.all_connected_users
                .length > 0 && (
                <div>
                  <span className="text-sm font-medium">
                    Connected User IDs:
                  </span>
                  <div className="flex gap-1 mt-1">
                    {connectionStatus.notification_service.all_connected_users.map(
                      (userId) => (
                        <Badge
                          key={userId}
                          variant="outline"
                          className="text-xs"
                        >
                          {userId}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Troubleshooting Recommendations */}
          {connectionStatus?.recommendations &&
            connectionStatus.recommendations.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">
                  Troubleshooting Recommendations
                </h3>
                <div className="space-y-2">
                  {connectionStatus.recommendations.map(
                    (recommendation, index) => (
                      <Alert key={index}>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          {recommendation}
                        </AlertDescription>
                      </Alert>
                    )
                  )}
                </div>
              </div>
            )}

          {/* Test Actions */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Test Actions
            </h3>
            <div className="flex gap-3 flex-wrap">
              <Button onClick={reconnect} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reconnect SSE
              </Button>

              <Button
                onClick={testWebhookNotification}
                disabled={testingNotification}
                variant="outline"
                size="sm"
              >
                <Activity
                  className={`h-4 w-4 mr-2 ${
                    testingNotification ? "animate-spin" : ""
                  }`}
                />
                Test Webhook Notification
              </Button>

              <Button onClick={testXPPopup} variant="outline" size="sm">
                <Zap className="h-4 w-4 mr-2" />
                Test XP Popup
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
