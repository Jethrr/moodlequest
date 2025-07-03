# Badge Achievement System - Implementation Guide

## Overview

The badge achievement system automatically checks and awards badges to users based on predefined criteria. This system supports multiple criteria types and provides real-time feedback when badges are earned.

## How Badge Checking Works

### 1. Badge Criteria Types

The system supports the following badge criteria types:

#### `quest_completion`

- **Description**: Award badge when user completes a certain number of quests
- **Criteria Format**:
  ```json
  {
    "type": "quest_completion",
    "target": 5,
    "description": "Complete 5 quests"
  }
  ```
- **Implementation**: Checks `QuestProgress` table for completed quests

#### `streak_days`

- **Description**: Award badge for maintaining login streaks
- **Criteria Format**:
  ```json
  {
    "type": "streak_days",
    "target": 7,
    "streak_type": "login",
    "description": "Login for 7 consecutive days"
  }
  ```
- **Implementation**: Checks `UserStreak` table for current streak

#### `xp_earned`

- **Description**: Award badge when user earns specific amount of XP
- **Criteria Format**:
  ```json
  {
    "type": "xp_earned",
    "target": 1000,
    "description": "Earn 1000 XP"
  }
  ```
- **Implementation**: Checks `StudentProgress` table for total XP

#### `daily_quest_streak`

- **Description**: Award badge for completing daily quests consecutively
- **Criteria Format**:
  ```json
  {
    "type": "daily_quest_streak",
    "target": 3,
    "description": "Complete daily quests for 3 days"
  }
  ```
- **Implementation**: Checks `UserDailyQuest` table for recent completions

#### Future Criteria Types (TODO)

- `grade_average`: For maintaining grade averages
- `assignment_submission`: For timely assignment submissions
- `participation`: For forum/discussion participation

### 2. Badge Service Methods

#### Core Methods

```python
# Check all badges for a user
badge_service.check_and_award_badges(user_id, course_id=None, awarded_by=None)

# Check specific badge criteria (without awarding)
badge_service._check_badge_criteria(user_id, badge)

# Calculate progress towards a badge
badge_service._calculate_progress(user_id, badge)

# Manually award a badge
badge_service.manually_award_badge(user_id, badge_id, awarded_by, course_id=None)
```

#### API Endpoints

```typescript
// Check all badges for a user
POST /api/badges/check-all/{user_id}

// Trigger badge check for specific events
POST /api/badges/trigger-check
Body: {
  "user_id": 1,
  "event_type": "quest_completed",
  "course_id": 1,
  "metadata": {}
}

// Check specific badge criteria
GET /api/badges/check-criteria/{user_id}/{badge_id}
```

### 3. Frontend Integration

#### Using the Badge Checker Hook

```typescript
import { useBadgeChecker } from "@/hooks/use-badge-checker";

function YourComponent() {
  const {
    onQuestCompleted,
    onUserLogin,
    onXpEarned,
    onDailyQuestCompleted,
    checkAllBadges,
    isChecking,
  } = useBadgeChecker();

  // When user completes a quest
  const handleQuestComplete = async (questId: number) => {
    // Your quest completion logic here...

    // Then check for badge achievements
    await onQuestCompleted(userId, courseId, questId);
  };

  // When user logs in
  const handleLogin = async () => {
    await onUserLogin(userId);
  };

  // When user earns XP
  const handleXpEarned = async (amount: number) => {
    await onXpEarned(userId, amount, courseId);
  };
}
```

#### Badge Notifications

The system automatically shows toast notifications when badges are earned:

```typescript
// Automatically triggered when badges are awarded
toast({
  title: "🎉 Badge Earned!",
  description: `You've earned the "${badge.name}" badge! (+${badge.exp_bonus} XP)`,
  duration: 5000,
});
```

## Implementation Examples

### 1. Quest Completion Badge

**Backend Badge Creation**:

```python
# Create a badge for completing 5 quests
badge = Badge(
    name="Quest Master",
    description="Complete 5 quests to prove your dedication",
    badge_type="achievement",
    image_url="/badges/quest-master.png",
    criteria={
        "type": "quest_completion",
        "target": 5,
        "description": "Complete 5 quests"
    },
    exp_value=100
)
```

**Frontend Usage**:

```typescript
// When a quest is completed
const completeQuest = async (questId: number) => {
  // Mark quest as complete in your system
  await markQuestComplete(questId);

  // Trigger badge check
  await onQuestCompleted(userId, courseId, questId);
};
```

### 2. XP Milestone Badge

**Backend Badge Creation**:

```python
badge = Badge(
    name="XP Collector",
    description="Earn 1000 XP to show your commitment",
    badge_type="milestone",
    criteria={
        "type": "xp_earned",
        "target": 1000,
        "description": "Earn 1000 XP"
    },
    exp_value=200
)
```

**Frontend Usage**:

```typescript
// When XP is awarded
const awardXP = async (amount: number) => {
  // Add XP to user's total
  await addXPToUser(userId, amount);

  // Check for XP-based badges
  await onXpEarned(userId, amount, courseId);
};
```

### 3. Login Streak Badge

**Backend Badge Creation**:

```python
badge = Badge(
    name="Dedicated Learner",
    description="Login for 7 consecutive days",
    badge_type="streak",
    criteria={
        "type": "streak_days",
        "target": 7,
        "streak_type": "login",
        "description": "Login for 7 consecutive days"
    },
    exp_value=150
)
```

**Frontend Usage**:

```typescript
// On user login
const handleUserLogin = async () => {
  // Update login streak in your system
  await updateLoginStreak(userId);

  // Check for streak-based badges
  await onUserLogin(userId);
};
```

## Testing Badge System

### Using the Dev Dashboard

1. Navigate to `/dev-dashboard`
2. Use the "Badge Criteria Testing" panel
3. Set the User ID
4. Click "Quick Event Triggers" to simulate events
5. View results in real-time

### Manual Testing

```typescript
// Check all badges for user 1
const result = await checkAllBadges(1);

// Trigger specific event
const result = await triggerEventBasedCheck({
  user_id: 1,
  event_type: "quest_completed",
  course_id: 1,
});

// Check specific badge criteria
const result = await checkSpecificBadge(1, 5);
```

## Best Practices

### 1. When to Trigger Badge Checks

- **Quest Completion**: After marking quest as complete
- **User Login**: During login process
- **XP Award**: After awarding XP to user
- **Daily Quest**: After daily quest completion
- **Periodic**: Run batch checks for all users (scheduled job)

### 2. Performance Considerations

- Badge checks are lightweight but avoid excessive calls
- Use event-based triggers rather than polling
- Consider implementing caching for frequently checked criteria
- Batch process badge checks for multiple users when possible

### 3. Error Handling

```typescript
try {
  await onQuestCompleted(userId, courseId, questId);
} catch (error) {
  console.error("Badge check failed:", error);
  // Continue with normal flow - badge checking failure shouldn't break the app
}
```

### 4. Badge Criteria Design

- Keep criteria simple and measurable
- Use clear, specific descriptions
- Set reasonable targets for user engagement
- Consider progressive difficulty (multiple badges for same activity)

## Database Considerations

### Required Tables

- `badges`: Badge definitions and criteria
- `user_badges`: User's earned badges
- `quest_progress`: Quest completion tracking
- `user_streak`: Streak tracking
- `student_progress`: XP and general progress
- `user_daily_quest`: Daily quest completion

### Indexing Recommendations

```sql
-- For efficient badge checking
CREATE INDEX idx_quest_progress_user_status ON quest_progress(user_id, status);
CREATE INDEX idx_user_streak_user_type ON user_streak(user_id, streak_type);
CREATE INDEX idx_student_progress_user ON student_progress(user_id);
CREATE INDEX idx_user_daily_quest_user_status ON user_daily_quest(user_id, status);
```

## Troubleshooting

### Common Issues

1. **Badges not being awarded**: Check criteria logic and database data
2. **Progress not updating**: Verify data is being written to tracking tables
3. **Performance issues**: Review database queries and add indexes
4. **Duplicate awards**: Check for proper unique constraints

### Debugging Tools

- Use the Badge Checker Panel in dev dashboard
- Check browser console for API errors
- Review backend logs for badge service errors
- Use the specific badge criteria endpoint to test individual badges

## Future Enhancements

1. **Custom Criteria Engine**: Allow teachers to define custom JavaScript criteria
2. **Badge Collections**: Group related badges into collections
3. **Badge Prerequisites**: Require certain badges before others can be earned
4. **Time-based Criteria**: Badges that expire or have time windows
5. **Social Badges**: Badges based on interaction with other users
6. **Advanced Analytics**: Detailed badge earning statistics and insights
