"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiClient } from "@/lib/api-client";
import { Award, Trophy, Star, Zap } from "lucide-react";
import type { Badge as BadgeType } from "@/types/badges";

export function BadgeSeederPanel() {
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const fetchBadges = async () => {
    try {
      setLoading(true);
      const badgeData = await apiClient.getAllBadges();
      setBadges(badgeData);
    } catch (err) {
      setError("Failed to fetch badges");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const seedBadges = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await apiClient.seedBadges();
      setMessage(result.message);
      // Refresh badges after seeding
      await fetchBadges();
    } catch (err) {
      setError("Failed to seed badges");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  const getBadgeIcon = (badgeType: string, name: string) => {
    if (
      name.toLowerCase().includes("level") ||
      name.toLowerCase().includes("champion")
    ) {
      return <Trophy className="h-4 w-4" />;
    }
    if (
      name.toLowerCase().includes("quest") ||
      name.toLowerCase().includes("completion")
    ) {
      return <Award className="h-4 w-4" />;
    }
    if (
      name.toLowerCase().includes("speed") ||
      name.toLowerCase().includes("streak")
    ) {
      return <Zap className="h-4 w-4" />;
    }
    return <Star className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Badge System
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={seedBadges} disabled={loading} variant="outline">
            {loading ? "Seeding..." : "Seed Predefined Badges"}
          </Button>
          <Button onClick={fetchBadges} disabled={loading} variant="outline">
            {loading ? "Loading..." : "Refresh Badges"}
          </Button>
        </div>

        {message && (
          <Alert>
            <AlertDescription className="text-green-600">
              {message}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <h4 className="font-semibold text-sm">
            Available Badges ({badges.length})
          </h4>
          <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
            {badges.map((badge) => (
              <div
                key={badge.badge_id}
                className="flex items-center justify-between p-2 border rounded-md text-sm"
              >
                <div className="flex items-center gap-2">
                  {getBadgeIcon(badge.badge_type, badge.name)}
                  <span className="font-medium">{badge.name}</span>
                  <Badge
                    variant={
                      badge.badge_type === "system" ? "default" : "secondary"
                    }
                  >
                    {badge.badge_type}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {badge.exp_value} XP
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
