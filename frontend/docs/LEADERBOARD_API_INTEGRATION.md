# Leaderboard API Integration

This document explains how to use the leaderboard API integration in the frontend application.

## Overview

The leaderboard system provides real-time rankings of students based on various metrics like experience points, quests completed, badges earned, and engagement scores. It supports both global leaderboards (across all courses) and course-specific leaderboards.

## Components

### 1. Leaderboard Service (`lib/leaderboard-service.ts`)

The main service class that handles all API communication with the backend leaderboard endpoints.

```typescript
import { leaderboardService } from '@/lib/leaderboard-service';

// Get global top students
const globalTop = await leaderboardService.getGlobalTopStudents(20);

// Get course-specific top students
const courseTop = await leaderboardService.getCourseTopStudents(courseId, 10);

// Get formatted data for the UI component
const data = await leaderboardService.getFormattedLeaderboardData(courseId, 'weekly', 'exp', 50);
```

### 2. Custom Hook (`hooks/useLeaderboard.ts`)

React hook that manages leaderboard state, loading, and API calls.

```typescript
import { useLeaderboard } from '@/hooks/useLeaderboard';

function MyComponent() {
  const {
    data,           // { topUsers, otherUsers, totalParticipants }
    loading,        // boolean
    error,          // string | null
    timeframe,      // current timeframe
    searchQuery,    // current search query
    searchResults,  // search results
    setTimeframe,   // function to change timeframe
    setSearchQuery, // function to search users
    refresh,        // function to refresh data
    loadMore,       // function to load more users
    hasMore         // boolean indicating if more data is available
  } = useLeaderboard({
    courseId: 1,              // optional course ID
    initialTimeframe: 'weekly', // 'daily' | 'weekly' | 'monthly' | 'all_time'
    autoFetch: true           // automatically fetch data on mount
  });

  // Component logic here...
}
```

### 3. Leaderboard Component (`components/dashboard/leaderboard.tsx`)

The main UI component that displays the leaderboard with podium, search, and filtering.

```typescript
import { Leaderboard } from '@/components/dashboard/leaderboard';

// Global leaderboard
<Leaderboard />

// Course-specific leaderboard
<Leaderboard courseId={1} />

// With custom styling
<Leaderboard courseId={1} className="custom-styles" />
```

## Usage Examples

### Basic Global Leaderboard

```typescript
import { GlobalLeaderboard } from '@/components/dashboard/leaderboard-examples';

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <GlobalLeaderboard />
    </div>
  );
}
```

### Course-Specific Leaderboard

```typescript
import { CourseLeaderboard } from '@/components/dashboard/leaderboard-examples';

function CoursePage({ courseId }: { courseId: number }) {
  return (
    <div>
      <h1>Course Overview</h1>
      <CourseLeaderboard courseId={courseId} />
    </div>
  );
}
```

### Compact Leaderboard Widget

```typescript
import { CompactLeaderboard } from '@/components/dashboard/leaderboard-examples';

function Sidebar() {
  return (
    <aside>
      <CompactLeaderboard courseId={1} />
    </aside>
  );
}
```

### Custom Implementation

```typescript
import { useLeaderboard } from '@/hooks/useLeaderboard';

function CustomLeaderboard() {
  const { data, loading, error, setTimeframe } = useLeaderboard({
    courseId: 1,
    initialTimeframe: 'monthly'
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <select onChange={(e) => setTimeframe(e.target.value as TimeFrameOption)}>
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
        <option value="all_time">All Time</option>
      </select>
      
      <div>
        {data.topUsers.map(user => (
          <div key={user.id}>{user.username} - {user.stats.exp_points} XP</div>
        ))}
      </div>
    </div>
  );
}
```

## API Endpoints

The leaderboard service integrates with the following backend endpoints:

- `GET /api/leaderboard` - Get all leaderboards with filtering
- `GET /api/leaderboard/{id}` - Get specific leaderboard
- `GET /api/leaderboard/top-students/global` - Get global top students
- `GET /api/leaderboard/top-students/course/{courseId}` - Get course top students
- `GET /api/leaderboard/course/{courseId}/summary` - Get course leaderboard summary
- `GET /api/leaderboard/progress/course/{courseId}` - Get course progress
- `POST /api/leaderboard/{id}/refresh` - Refresh leaderboard rankings (admin/teacher)

## Types

### Key Interfaces

```typescript
interface LeaderboardUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  profile_image_url: string | null;
  rank: string; // 'Master' | 'Expert' | 'Intermediate' | 'Beginner'
  stats: {
    quests_completed: number;
    exp_points: number;
    rank_score: number;
  };
  level: number;
  position?: number;
}

interface Leaderboard {
  leaderboard_id: number;
  name: string;
  description?: string;
  course_id?: number;
  metric_type: 'exp' | 'quests_completed' | 'badges_earned' | 'engagement_score';
  timeframe: 'daily' | 'weekly' | 'monthly' | 'all_time';
  is_active: boolean;
  created_at: string;
  last_updated: string;
  entries: LeaderboardEntry[];
}

type TimeFrameOption = 'daily' | 'weekly' | 'monthly' | 'all_time';
type MetricType = 'exp' | 'quests_completed' | 'badges_earned' | 'engagement_score';
```

## Features

### Search Functionality
- Real-time search with debouncing (300ms delay)
- Searches across username, first name, and last name
- Maintains search state across component re-renders

### Timeframe Filtering
- Daily, Weekly, Monthly, and All-Time views
- Automatic data refresh when timeframe changes
- Persistent timeframe selection

### Pagination
- Load more functionality for large leaderboards
- Configurable page sizes
- Infinite scroll support

### Error Handling
- Graceful error handling with user-friendly messages
- Retry functionality for failed requests
- Fallback to empty state when no data available

### Loading States
- Skeleton loading for initial data fetch
- Loading indicators for search and pagination
- Non-blocking updates for better UX

## Configuration

### Environment Variables

Make sure your `.env.local` includes:

```env
NEXT_PUBLIC_API_URL=http://localhost:8002/api
```

### Authentication

The leaderboard service automatically includes authentication headers when available through the `apiClient`. Make sure users are authenticated before accessing leaderboard data.

## Styling

The leaderboard component uses Tailwind CSS and shadcn/ui components. It supports:

- Dark/light mode
- Responsive design
- Custom styling via className prop
- Animated transitions and hover effects

## Performance Considerations

- Data is cached in the React component state
- Debounced search to reduce API calls
- Pagination to limit data fetched at once
- Optimistic updates for better perceived performance

## Troubleshooting

### Common Issues

1. **No data showing**: Check if the backend API is running and authentication is working
2. **Search not working**: Verify the search endpoint is implemented and accessible
3. **Styling issues**: Ensure Tailwind CSS and shadcn/ui are properly configured
4. **Type errors**: Make sure all type definitions are imported correctly

### Debug Mode

Enable console logging by setting:

```typescript
// In your component
console.log('Leaderboard data:', data);
console.log('Loading state:', loading);
console.log('Error state:', error);
```

## Future Enhancements

- Real-time updates via WebSocket
- Advanced filtering (by course, metric type, etc.)
- Export functionality
- Detailed user profiles
- Achievement badges display
- Mobile-optimized layouts 