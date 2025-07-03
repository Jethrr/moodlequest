/**
 * Debug Component to check user ID mapping and badge data
 */
import { useCurrentUser } from "@/hooks/useCurrentMoodleUser";
import { useBadgeCollection } from "@/hooks/use-badge-collection";

export function BadgeDebugPanel() {
  const { user } = useCurrentUser();
  const { earnedBadges, availableBadges, userBadges, loading, error } =
    useBadgeCollection(user?.id);

  if (!user) {
    return (
      <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
        <h3 className="font-bold">🚨 User Debug Info</h3>
        <p>No user found in localStorage</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-100 border border-blue-400 rounded space-y-4">
      <h3 className="font-bold">🐛 Badge Debug Panel</h3>

      <div>
        <h4 className="font-semibold">User Info:</h4>
        <ul className="text-sm">
          <li>
            <strong>Local ID:</strong> {user.id}
          </li>
          <li>
            <strong>Moodle ID:</strong> {user.moodle_user_id}
          </li>
          <li>
            <strong>Username:</strong> {user.username}
          </li>
          <li>
            <strong>Email:</strong> {user.email}
          </li>
        </ul>
      </div>

      <div>
        <h4 className="font-semibold">Badge API Call:</h4>
        <p className="text-sm">
          Using user ID: <strong>{user?.id}</strong>
        </p>
        <p className="text-sm">
          API endpoint: <code>/api/badges/user/{user?.id}/progress</code>
        </p>
      </div>

      <div>
        <h4 className="font-semibold">Badge Data:</h4>
        <ul className="text-sm">
          <li>
            <strong>Loading:</strong> {loading ? "Yes" : "No"}
          </li>
          <li>
            <strong>Error:</strong> {error || "None"}
          </li>
          <li>
            <strong>Earned Badges:</strong> {earnedBadges.length}
          </li>
          <li>
            <strong>Available Badges:</strong> {availableBadges.length}
          </li>
          <li>
            <strong>Raw User Badges:</strong> {userBadges.length}
          </li>
        </ul>
      </div>

      {earnedBadges.length > 0 && (
        <div>
          <h4 className="font-semibold">Earned Badges:</h4>
          <ul className="text-sm">
            {earnedBadges.map((badge, index) => (
              <li key={index}>
                • {badge.badge.name} (ID: {badge.badge.badge_id}) - Earned:{" "}
                {badge.earnedAt}
              </li>
            ))}
          </ul>
        </div>
      )}

      {userBadges.length > 0 && (
        <div>
          <h4 className="font-semibold">Raw User Badge Data:</h4>
          <ul className="text-sm">
            {userBadges.map((ub, index) => (
              <li key={index}>
                • Badge ID: {ub.badge_id} - Awarded: {ub.awarded_at}
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <div className="p-2 bg-red-100 border border-red-400 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
}
