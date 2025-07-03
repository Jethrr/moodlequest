# Advanced Learning Analytics: Metrics and Algorithms for MoodleQuest

## Table of Contents

1. [Core Learning Analytics Metrics](#core-learning-analytics-metrics)
2. [Learning Progression Analytics](#learning-progression-analytics)
3. [Advanced Behavioral Analytics](#advanced-behavioral-analytics)
4. [Predictive Risk Assessment](#predictive-risk-assessment)
5. [Comparative Analytics](#comparative-analytics)
6. [AI-Powered Insight Generation](#ai-powered-insight-generation)
7. [Implementation Strategy](#implementation-strategy)

---

## Core Learning Analytics Metrics

### 1. Engagement Metrics (Beyond Simple Time)

#### A. Cognitive Load Index (CLI)

Measures mental effort based on task complexity and user behavior patterns.

```python
def calculate_cognitive_load(user_activities):
    """
    Measures mental effort based on:
    - Task switching frequency
    - Error patterns
    - Response time variance
    - Help-seeking behavior

    Returns: CLI score (0-100) where higher values indicate cognitive overload
    """
    task_switches = count_context_switches(user_activities)
    error_rate = calculate_error_patterns(user_activities)
    response_variance = calculate_response_time_variance(user_activities)
    help_frequency = count_help_requests(user_activities)

    # Weighted cognitive load score (0-100)
    cli_score = (
        (task_switches * 0.25) +
        (error_rate * 0.35) +
        (response_variance * 0.20) +
        (help_frequency * 0.20)
    )
    return min(cli_score, 100)

def count_context_switches(activities):
    """Count rapid changes between different types of activities"""
    switches = 0
    prev_type = None
    for activity in activities:
        if prev_type and activity.type != prev_type:
            switches += 1
        prev_type = activity.type
    return switches / len(activities) * 100  # Normalized

def calculate_error_patterns(activities):
    """Analyze error frequency and recovery patterns"""
    errors = [a for a in activities if a.result == 'error']
    total_attempts = len(activities)

    if total_attempts == 0:
        return 0

    error_rate = len(errors) / total_attempts

    # Weight by error clustering (many errors in short time = higher load)
    error_clusters = identify_error_clusters(errors)
    cluster_penalty = len(error_clusters) * 0.1

    return min((error_rate + cluster_penalty) * 100, 100)

def calculate_response_time_variance(activities):
    """High variance in response times indicates cognitive strain"""
    response_times = [a.response_time for a in activities if a.response_time]

    if len(response_times) < 2:
        return 0

    mean_time = statistics.mean(response_times)
    variance = statistics.variance(response_times)

    # Coefficient of variation (normalized variance)
    cv = (variance ** 0.5) / mean_time if mean_time > 0 else 0
    return min(cv * 100, 100)
```

#### B. Flow State Detection

Identifies optimal learning states using psychological flow theory.

```python
def detect_flow_state(session_data):
    """
    Identifies optimal learning states using:
    - Consistent interaction patterns
    - Reduced help-seeking
    - Steady progress without frustration indicators

    Returns: Flow score (0-1) where 1 indicates perfect flow state
    """
    interaction_consistency = calculate_interaction_rhythm(session_data)
    progress_momentum = measure_steady_advancement(session_data)
    frustration_indicators = detect_frustration_signals(session_data)

    flow_score = (
        interaction_consistency * 0.4 +
        progress_momentum * 0.4 -
        frustration_indicators * 0.2
    )
    return max(0, min(flow_score, 1))

def calculate_interaction_rhythm(session_data):
    """Measures consistency in user interaction patterns"""
    interaction_intervals = []
    prev_timestamp = None

    for interaction in session_data.interactions:
        if prev_timestamp:
            interval = interaction.timestamp - prev_timestamp
            interaction_intervals.append(interval.total_seconds())
        prev_timestamp = interaction.timestamp

    if len(interaction_intervals) < 3:
        return 0

    # Calculate rhythm consistency using coefficient of variation
    mean_interval = statistics.mean(interaction_intervals)
    std_interval = statistics.stdev(interaction_intervals)

    consistency = 1 - (std_interval / mean_interval) if mean_interval > 0 else 0
    return max(0, min(consistency, 1))

def measure_steady_advancement(session_data):
    """Measures consistent progress without major setbacks"""
    progress_points = session_data.progress_milestones

    if len(progress_points) < 2:
        return 0

    positive_progress = 0
    total_transitions = len(progress_points) - 1

    for i in range(1, len(progress_points)):
        if progress_points[i].score >= progress_points[i-1].score:
            positive_progress += 1

    momentum = positive_progress / total_transitions
    return momentum

def detect_frustration_signals(session_data):
    """Identifies behavioral indicators of frustration"""
    frustration_score = 0

    # Rapid clicking/interaction spikes
    interaction_spikes = detect_interaction_spikes(session_data)
    frustration_score += len(interaction_spikes) * 0.1

    # Help-seeking escalation
    help_escalation = detect_help_escalation(session_data)
    frustration_score += help_escalation * 0.2

    # Task abandonment patterns
    abandonments = count_task_abandonments(session_data)
    frustration_score += abandonments * 0.3

    # Extended idle periods after errors
    idle_after_errors = detect_idle_after_errors(session_data)
    frustration_score += idle_after_errors * 0.2

    return min(frustration_score, 1)
```

#### C. Attention Span Analysis

Measures focus and concentration patterns.

```python
def analyze_attention_patterns(user_interactions):
    """
    Measures focus using:
    - Click/interaction frequency patterns
    - Page focus/blur events
    - Interaction velocity decay

    Returns: Comprehensive attention analysis
    """
    focus_events = extract_focus_events(user_interactions)
    interaction_velocity = calculate_interaction_decay(user_interactions)
    attention_breaks = identify_distraction_patterns(user_interactions)

    return {
        'average_attention_span': calculate_avg_focus_duration(focus_events),
        'attention_decay_rate': interaction_velocity,
        'distraction_frequency': len(attention_breaks),
        'peak_focus_periods': identify_peak_focus_periods(focus_events),
        'attention_consistency': calculate_attention_consistency(focus_events)
    }

def extract_focus_events(interactions):
    """Extract periods of sustained focus from interaction data"""
    focus_periods = []
    current_focus_start = None
    last_interaction = None

    FOCUS_THRESHOLD = 30  # seconds between interactions to maintain focus

    for interaction in interactions:
        if last_interaction:
            gap = (interaction.timestamp - last_interaction.timestamp).total_seconds()

            if gap > FOCUS_THRESHOLD:
                # Focus break detected
                if current_focus_start:
                    focus_periods.append({
                        'start': current_focus_start,
                        'end': last_interaction.timestamp,
                        'duration': (last_interaction.timestamp - current_focus_start).total_seconds()
                    })
                current_focus_start = interaction.timestamp
            elif not current_focus_start:
                current_focus_start = interaction.timestamp
        else:
            current_focus_start = interaction.timestamp

        last_interaction = interaction

    # Close final focus period
    if current_focus_start and last_interaction:
        focus_periods.append({
            'start': current_focus_start,
            'end': last_interaction.timestamp,
            'duration': (last_interaction.timestamp - current_focus_start).total_seconds()
        })

    return focus_periods

def calculate_interaction_decay(interactions):
    """Measures how interaction rate changes over time"""
    if len(interactions) < 10:
        return 0

    # Split session into time windows
    session_start = interactions[0].timestamp
    session_end = interactions[-1].timestamp
    session_duration = (session_end - session_start).total_seconds()

    if session_duration < 300:  # Less than 5 minutes
        return 0

    window_size = session_duration / 10  # 10 time windows
    window_interaction_counts = []

    for i in range(10):
        window_start = session_start + timedelta(seconds=i * window_size)
        window_end = window_start + timedelta(seconds=window_size)

        window_interactions = [
            interaction for interaction in interactions
            if window_start <= interaction.timestamp < window_end
        ]
        window_interaction_counts.append(len(window_interactions))

    # Calculate decay rate using linear regression
    x = list(range(10))
    y = window_interaction_counts

    if len(set(y)) == 1:  # All values are the same
        return 0

    slope, _, r_value, _, _ = stats.linregress(x, y)

    # Negative slope indicates decay, positive indicates sustained/increasing attention
    return -slope if slope < 0 else 0
```

---

## Learning Progression Analytics

### 1. Bloom's Taxonomy Progression

Tracks advancement through cognitive complexity levels.

```python
class BloomsAnalyzer:
    LEVELS = {
        'remember': 1,      # Basic recall questions
        'understand': 2,    # Comprehension tasks
        'apply': 3,         # Application problems
        'analyze': 4,       # Analysis questions
        'evaluate': 5,      # Evaluation tasks
        'create': 6         # Creative/synthesis tasks
    }

    def analyze_cognitive_progression(self, completed_quests):
        """
        Tracks advancement through cognitive complexity levels

        Returns: Comprehensive cognitive development analysis
        """
        quest_levels = []
        for quest in completed_quests:
            cognitive_level = self.classify_quest_complexity(quest)
            quest_levels.append({
                'quest_id': quest.id,
                'timestamp': quest.completed_at,
                'bloom_level': cognitive_level,
                'difficulty': quest.difficulty
            })

        # Sort by completion time
        quest_levels.sort(key=lambda x: x['timestamp'])

        progression_score = self.calculate_bloom_progression(quest_levels)
        return {
            'current_bloom_level': max([ql['bloom_level'] for ql in quest_levels]) if quest_levels else 0,
            'progression_velocity': self.calculate_advancement_rate(quest_levels),
            'cognitive_gaps': self.identify_skill_gaps(quest_levels),
            'mastery_indicators': self.assess_level_mastery(quest_levels),
            'next_level_readiness': self.predict_readiness_for_next_level(quest_levels)
        }

    def classify_quest_complexity(self, quest):
        """Classify quest based on Bloom's taxonomy"""
        # This would analyze quest content, question types, required skills
        quest_keywords = quest.description.lower()

        complexity_indicators = {
            6: ['create', 'design', 'develop', 'compose', 'plan', 'construct'],
            5: ['evaluate', 'judge', 'critique', 'assess', 'compare', 'contrast'],
            4: ['analyze', 'examine', 'investigate', 'categorize', 'classify'],
            3: ['apply', 'implement', 'execute', 'solve', 'demonstrate'],
            2: ['explain', 'describe', 'interpret', 'summarize', 'paraphrase'],
            1: ['remember', 'recall', 'identify', 'list', 'name', 'state']
        }

        for level in range(6, 0, -1):
            if any(keyword in quest_keywords for keyword in complexity_indicators[level]):
                return level

        return 1  # Default to remember level

    def calculate_advancement_rate(self, quest_levels):
        """Calculate how quickly student advances through Bloom levels"""
        if len(quest_levels) < 2:
            return 0

        level_progressions = []
        current_max = 0

        for quest_level in quest_levels:
            if quest_level['bloom_level'] > current_max:
                level_progressions.append({
                    'new_level': quest_level['bloom_level'],
                    'timestamp': quest_level['timestamp']
                })
                current_max = quest_level['bloom_level']

        if len(level_progressions) < 2:
            return 0

        # Calculate average time between level advances
        time_deltas = []
        for i in range(1, len(level_progressions)):
            delta = level_progressions[i]['timestamp'] - level_progressions[i-1]['timestamp']
            time_deltas.append(delta.total_seconds() / 3600)  # Convert to hours

        return 1 / statistics.mean(time_deltas) if time_deltas else 0  # Levels per hour

    def identify_skill_gaps(self, quest_levels):
        """Identify missing or weak cognitive skill areas"""
        level_frequencies = {level: 0 for level in range(1, 7)}

        for quest_level in quest_levels:
            level_frequencies[quest_level['bloom_level']] += 1

        total_quests = len(quest_levels)
        level_percentages = {
            level: (count / total_quests * 100) if total_quests > 0 else 0
            for level, count in level_frequencies.items()
        }

        # Identify underrepresented levels
        gaps = []
        expected_distribution = {1: 20, 2: 25, 3: 25, 4: 15, 5: 10, 6: 5}  # Ideal distribution

        for level, expected_pct in expected_distribution.items():
            actual_pct = level_percentages[level]
            if actual_pct < expected_pct * 0.5:  # Less than half expected
                gaps.append({
                    'bloom_level': level,
                    'level_name': list(self.LEVELS.keys())[level-1],
                    'expected_percentage': expected_pct,
                    'actual_percentage': actual_pct,
                    'gap_severity': (expected_pct - actual_pct) / expected_pct
                })

        return gaps
```

### 2. Knowledge Retention Curve

Implements Ebbinghaus Forgetting Curve analysis.

```python
def calculate_retention_score(user_id, timeframe_days=30):
    """
    Implements Ebbinghaus Forgetting Curve analysis

    Returns: Comprehensive retention analysis based on memory research
    """
    learning_events = get_learning_events(user_id, timeframe_days)
    review_events = get_review_events(user_id, timeframe_days)
    assessment_events = get_assessment_events(user_id, timeframe_days)

    retention_scores = []

    for event in learning_events:
        days_since_learning = (datetime.now() - event.timestamp).days

        # Base Ebbinghaus formula: R(t) = e^(-t/S) where S is memory strength
        memory_strength = calculate_memory_strength(event)
        natural_retention = math.exp(-days_since_learning / memory_strength)

        # Adjust for reviews and reinforcement
        review_boost = calculate_review_impact(event, review_events)

        # Adjust for successful recalls (assessment performance)
        recall_reinforcement = calculate_recall_reinforcement(event, assessment_events)

        # Combined retention score
        actual_retention = natural_retention * (1 + review_boost) * (1 + recall_reinforcement)
        retention_scores.append(min(actual_retention, 1.0))

    return {
        'average_retention': statistics.mean(retention_scores) if retention_scores else 0,
        'retention_trend': calculate_retention_trend(retention_scores),
        'forgetting_rate': calculate_forgetting_velocity(retention_scores),
        'memory_strength_score': calculate_overall_memory_strength(learning_events),
        'review_effectiveness': assess_review_strategy_effectiveness(review_events, retention_scores)
    }

def calculate_memory_strength(learning_event):
    """Calculate initial memory strength based on learning context"""
    base_strength = 7  # Days (average memory without reinforcement)

    # Factors that increase memory strength
    depth_factor = 1.0
    if learning_event.engagement_level > 0.8:
        depth_factor += 0.5  # Deep engagement

    if learning_event.contains_elaboration:
        depth_factor += 0.3  # Elaborative learning

    if learning_event.involves_application:
        depth_factor += 0.4  # Applied learning

    difficulty_factor = 1.0
    if learning_event.difficulty == 'challenging':
        difficulty_factor += 0.2  # Desirable difficulty
    elif learning_event.difficulty == 'too_easy':
        difficulty_factor -= 0.3  # Insufficient challenge

    return base_strength * depth_factor * difficulty_factor

def calculate_review_impact(learning_event, review_events):
    """Calculate how reviews affect retention"""
    relevant_reviews = [
        review for review in review_events
        if review.content_id == learning_event.content_id
        and review.timestamp > learning_event.timestamp
    ]

    if not relevant_reviews:
        return 0

    review_boost = 0
    for review in relevant_reviews:
        days_since_learning = (review.timestamp - learning_event.timestamp).days

        # Spaced repetition effectiveness curve
        if days_since_learning <= 1:
            boost = 0.1  # Same day review - minimal benefit
        elif days_since_learning <= 3:
            boost = 0.3  # Optimal first review timing
        elif days_since_learning <= 7:
            boost = 0.4  # Good spacing
        elif days_since_learning <= 14:
            boost = 0.3  # Reasonable spacing
        else:
            boost = 0.2  # Late but still helpful

        # Quality of review matters
        boost *= review.engagement_level
        review_boost += boost

    return min(review_boost, 1.0)  # Cap at 100% boost

def calculate_recall_reinforcement(learning_event, assessment_events):
    """Calculate reinforcement from successful recalls"""
    relevant_assessments = [
        assessment for assessment in assessment_events
        if assessment.content_id == learning_event.content_id
        and assessment.timestamp > learning_event.timestamp
    ]

    if not relevant_assessments:
        return 0

    recall_boost = 0
    for assessment in relevant_assessments:
        if assessment.success_rate > 0.7:  # Successful recall
            days_since_learning = (assessment.timestamp - learning_event.timestamp).days

            # Testing effect - successful retrieval strengthens memory
            base_boost = 0.2 * assessment.success_rate

            # Timing matters for testing effect
            if days_since_learning <= 7:
                timing_multiplier = 1.5  # Recent testing very effective
            elif days_since_learning <= 30:
                timing_multiplier = 1.2  # Good timing
            else:
                timing_multiplier = 1.0  # Standard benefit

            recall_boost += base_boost * timing_multiplier

    return min(recall_boost, 0.8)  # Cap boost
```

---

## Advanced Behavioral Analytics

### 1. Learning Pattern Classification

Identifies learning behavior patterns using machine learning.

```python
class LearningStyleAnalyzer:
    def __init__(self):
        self.behavioral_patterns = {
            'sequential': 'Prefers step-by-step, linear progression',
            'global': 'Needs big picture before details',
            'active': 'Learns by doing and experimenting',
            'reflective': 'Learns by thinking and analyzing',
            'sensing': 'Prefers concrete, practical information',
            'intuitive': 'Prefers abstract concepts and theories',
            'visual': 'Learns best with diagrams and visual aids',
            'verbal': 'Learns best with written and spoken explanations'
        }

    def classify_learning_behavior(self, user_interactions):
        """
        Identifies learning patterns using clustering algorithms

        Returns: Learning style profile with confidence scores
        """
        features = self.extract_behavioral_features(user_interactions)

        # Feature vector for classification
        behavioral_vector = [
            features['session_length_preference'],    # Short bursts vs long sessions
            features['error_recovery_speed'],         # How quickly they bounce back
            features['exploration_tendency'],         # Try new things vs stick to known
            features['help_seeking_pattern'],         # Independent vs collaborative
            features['challenge_preference'],         # Difficulty level preference
            features['feedback_responsiveness'],      # How they react to feedback
            features['persistence_score'],            # Giving up vs pushing through
            features['metacognitive_awareness'],      # Self-reflection indicators
            features['sequential_vs_random'],         # Order preference
            features['detail_vs_overview'],           # Information processing style
        ]

        # Classify learning style using trained model or rule-based system
        learning_style_scores = self.classify_pattern(behavioral_vector)

        return {
            'primary_style': max(learning_style_scores, key=learning_style_scores.get),
            'style_scores': learning_style_scores,
            'confidence_level': self.calculate_classification_confidence(behavioral_vector),
            'recommendations': self.generate_style_recommendations(learning_style_scores)
        }

    def extract_behavioral_features(self, interactions):
        """Extract behavioral features from user interactions"""
        features = {}

        # Session length preference
        session_lengths = [session.duration for session in self.get_learning_sessions(interactions)]
        if session_lengths:
            avg_session = statistics.mean(session_lengths)
            features['session_length_preference'] = min(avg_session / 3600, 3)  # Normalize to 0-3 hours
        else:
            features['session_length_preference'] = 1

        # Error recovery speed
        error_recoveries = self.analyze_error_recovery_patterns(interactions)
        features['error_recovery_speed'] = self.calculate_recovery_speed_score(error_recoveries)

        # Exploration tendency
        exploration_events = self.count_exploration_behaviors(interactions)
        total_events = len(interactions)
        features['exploration_tendency'] = exploration_events / total_events if total_events > 0 else 0

        # Help seeking pattern
        help_requests = self.analyze_help_seeking_behavior(interactions)
        features['help_seeking_pattern'] = self.classify_help_seeking_style(help_requests)

        # Challenge preference
        challenge_choices = self.analyze_difficulty_choices(interactions)
        features['challenge_preference'] = self.calculate_challenge_preference_score(challenge_choices)

        # Feedback responsiveness
        feedback_responses = self.analyze_feedback_utilization(interactions)
        features['feedback_responsiveness'] = self.score_feedback_responsiveness(feedback_responses)

        # Persistence score
        quit_patterns = self.analyze_task_persistence(interactions)
        features['persistence_score'] = self.calculate_persistence_score(quit_patterns)

        # Metacognitive awareness
        metacognitive_behaviors = self.identify_metacognitive_behaviors(interactions)
        features['metacognitive_awareness'] = self.score_metacognitive_awareness(metacognitive_behaviors)

        # Sequential vs random preference
        navigation_patterns = self.analyze_navigation_patterns(interactions)
        features['sequential_vs_random'] = self.score_sequential_preference(navigation_patterns)

        # Detail vs overview preference
        content_access_patterns = self.analyze_content_access_patterns(interactions)
        features['detail_vs_overview'] = self.score_detail_preference(content_access_patterns)

        return features

    def classify_pattern(self, behavioral_vector):
        """Classify learning style based on behavioral vector"""
        # This could use a trained ML model, but here's a rule-based approach
        style_scores = {}

        # Sequential vs Global
        sequential_score = behavioral_vector[8]  # sequential_vs_random
        style_scores['sequential'] = sequential_score
        style_scores['global'] = 1 - sequential_score

        # Active vs Reflective
        exploration = behavioral_vector[2]  # exploration_tendency
        persistence = behavioral_vector[6]  # persistence_score
        active_score = (exploration + persistence) / 2
        style_scores['active'] = active_score
        style_scores['reflective'] = 1 - active_score

        # Sensing vs Intuitive
        detail_preference = behavioral_vector[9]  # detail_vs_overview
        challenge_preference = behavioral_vector[4]  # challenge_preference
        sensing_score = (detail_preference + (1 - challenge_preference)) / 2
        style_scores['sensing'] = sensing_score
        style_scores['intuitive'] = 1 - sensing_score

        # Visual vs Verbal (would need additional data about content preferences)
        # For now, use help-seeking and feedback responsiveness as proxies
        help_seeking = behavioral_vector[3]  # help_seeking_pattern
        feedback_resp = behavioral_vector[5]  # feedback_responsiveness
        verbal_score = (help_seeking + feedback_resp) / 2
        style_scores['verbal'] = verbal_score
        style_scores['visual'] = 1 - verbal_score

        return style_scores
```

### 2. Motivation State Detection

Analyzes motivation using Self-Determination Theory.

```python
def detect_motivation_level(recent_activities):
    """
    Analyzes motivation using Self-Determination Theory metrics
    - Autonomy: Feeling of control and choice
    - Competence: Feeling capable and effective
    - Relatedness: Social connection and belonging

    Returns: Comprehensive motivation analysis
    """
    autonomy_score = measure_self_directed_choices(recent_activities)
    competence_score = analyze_challenge_success_ratio(recent_activities)
    relatedness_score = measure_social_engagement(recent_activities)

    # Weighted motivation index based on SDT research
    motivation_index = (
        autonomy_score * 0.35 +      # Control over learning
        competence_score * 0.40 +    # Feeling capable
        relatedness_score * 0.25     # Social connection
    )

    # Additional motivation indicators
    intrinsic_indicators = detect_intrinsic_motivation_signals(recent_activities)
    flow_frequency = calculate_flow_state_frequency(recent_activities)
    goal_orientation = analyze_goal_orientation(recent_activities)

    return {
        'overall_motivation': motivation_index,
        'autonomy_level': autonomy_score,
        'competence_feeling': competence_score,
        'social_connectedness': relatedness_score,
        'intrinsic_motivation': intrinsic_indicators,
        'flow_frequency': flow_frequency,
        'goal_orientation': goal_orientation,
        'motivation_trend': calculate_motivation_trajectory(recent_activities),
        'risk_factors': identify_motivation_risk_factors(recent_activities)
    }

def measure_self_directed_choices(activities):
    """Measure autonomy through choice-making behavior"""
    choice_points = [a for a in activities if a.involves_choice]

    if not choice_points:
        return 0.5  # Neutral if no choice data

    autonomy_indicators = {
        'path_customization': 0,      # Choosing own learning path
        'optional_activities': 0,     # Engaging with optional content
        'difficulty_adjustment': 0,   # Self-adjusting difficulty
        'goal_setting': 0,           # Setting personal goals
        'pace_control': 0            # Controlling learning pace
    }

    for choice in choice_points:
        if choice.type == 'learning_path_choice':
            autonomy_indicators['path_customization'] += 1
        elif choice.type == 'optional_activity':
            autonomy_indicators['optional_activities'] += 1
        elif choice.type == 'difficulty_selection':
            autonomy_indicators['difficulty_adjustment'] += 1
        elif choice.type == 'goal_setting':
            autonomy_indicators['goal_setting'] += 1
        elif choice.type == 'pace_control':
            autonomy_indicators['pace_control'] += 1

    # Normalize by total choice opportunities
    total_choices = len(choice_points)
    autonomy_score = sum(autonomy_indicators.values()) / total_choices

    return min(autonomy_score, 1.0)

def analyze_challenge_success_ratio(activities):
    """Measure competence through challenge-success patterns"""
    challenge_activities = [a for a in activities if hasattr(a, 'difficulty_level')]

    if not challenge_activities:
        return 0.5  # Neutral if no challenge data

    competence_factors = {
        'optimal_challenge_zone': 0,   # Activities in optimal difficulty range
        'success_progression': 0,      # Increasing success on harder tasks
        'mastery_indicators': 0,       # Signs of skill mastery
        'self_efficacy_signals': 0     # Confidence in abilities
    }

    # Analyze optimal challenge zone (should be ~70-80% success rate)
    success_rates_by_difficulty = {}
    for activity in challenge_activities:
        difficulty = activity.difficulty_level
        if difficulty not in success_rates_by_difficulty:
            success_rates_by_difficulty[difficulty] = []
        success_rates_by_difficulty[difficulty].append(activity.success)

    optimal_zone_score = 0
    for difficulty, successes in success_rates_by_difficulty.items():
        success_rate = sum(successes) / len(successes)
        if 0.7 <= success_rate <= 0.8:  # Optimal challenge zone
            optimal_zone_score += len(successes)

    competence_factors['optimal_challenge_zone'] = optimal_zone_score / len(challenge_activities)

    # Analyze progression in harder tasks
    sorted_activities = sorted(challenge_activities, key=lambda x: x.timestamp)
    difficulty_progression = []
    success_progression = []

    for activity in sorted_activities:
        difficulty_progression.append(activity.difficulty_level)
        success_progression.append(activity.success)

    # Calculate if success rate improves over time for harder tasks
    if len(success_progression) >= 10:  # Need sufficient data
        recent_success = statistics.mean(success_progression[-10:])
        earlier_success = statistics.mean(success_progression[:10])

        if recent_success > earlier_success:
            competence_factors['success_progression'] = min((recent_success - earlier_success) * 2, 1.0)

    # Identify mastery indicators
    mastery_signals = [
        a for a in challenge_activities
        if a.success and a.completion_time < a.expected_time * 0.8  # Fast and accurate
    ]
    competence_factors['mastery_indicators'] = len(mastery_signals) / len(challenge_activities)

    # Self-efficacy signals (choosing harder challenges, persistence)
    self_efficacy_behaviors = [
        a for a in challenge_activities
        if (a.self_selected_difficulty and a.difficulty_level > 'easy') or
           (hasattr(a, 'attempts') and a.attempts > 1 and a.success)
    ]
    competence_factors['self_efficacy_signals'] = len(self_efficacy_behaviors) / len(challenge_activities)

    return statistics.mean(competence_factors.values())

def measure_social_engagement(activities):
    """Measure relatedness through social learning behaviors"""
    social_activities = [a for a in activities if hasattr(a, 'social_component')]

    if not social_activities:
        # Check for other social indicators
        help_seeking = len([a for a in activities if a.type == 'help_request'])
        sharing_behaviors = len([a for a in activities if a.type == 'share_achievement'])

        if help_seeking + sharing_behaviors == 0:
            return 0.3  # Low social engagement
        else:
            return 0.5  # Some social indicators

    relatedness_factors = {
        'peer_interaction': 0,        # Engaging with peers
        'collaborative_learning': 0,  # Working together on tasks
        'help_giving': 0,            # Helping other students
        'community_participation': 0, # Participating in discussions
        'social_recognition': 0       # Sharing achievements
    }

    for activity in social_activities:
        if activity.social_component == 'peer_interaction':
            relatedness_factors['peer_interaction'] += 1
        elif activity.social_component == 'collaboration':
            relatedness_factors['collaborative_learning'] += 1
        elif activity.social_component == 'help_giving':
            relatedness_factors['help_giving'] += 1
        elif activity.social_component == 'discussion':
            relatedness_factors['community_participation'] += 1
        elif activity.social_component == 'achievement_sharing':
            relatedness_factors['social_recognition'] += 1

    # Normalize by opportunities for social engagement
    total_social_opportunities = len(social_activities)
    relatedness_score = sum(relatedness_factors.values()) / total_social_opportunities

    return min(relatedness_score, 1.0)
```

---

## Predictive Risk Assessment

### 1. Early Warning System Algorithm

Predicts likelihood of student disengagement or failure.

```python
class RiskPredictionModel:
    def __init__(self):
        # Risk factor weights based on educational research
        self.risk_factors = {
            'declining_engagement': 0.25,      # Decreasing participation
            'increasing_cognitive_load': 0.20, # Cognitive overload signs
            'social_isolation': 0.15,          # Lack of peer interaction
            'inconsistent_progress': 0.20,     # Erratic performance patterns
            'negative_feedback_loops': 0.20    # Frustration cycles
        }

        # Intervention thresholds
        self.risk_thresholds = {
            'low': 0.3,
            'medium': 0.5,
            'high': 0.7,
            'critical': 0.85
        }

    def calculate_risk_score(self, student_metrics, historical_data=None):
        """
        Predicts likelihood of student disengagement or failure

        Returns: Comprehensive risk assessment with intervention recommendations
        """
        risk_indicators = {
            'declining_engagement': self.detect_engagement_decline(student_metrics),
            'increasing_cognitive_load': self.measure_cognitive_overload(student_metrics),
            'social_isolation': self.assess_social_connection(student_metrics),
            'inconsistent_progress': self.analyze_progress_volatility(student_metrics),
            'negative_feedback_loops': self.identify_frustration_cycles(student_metrics)
        }

        # Calculate weighted risk score
        weighted_risk = sum(
            indicator_value * self.risk_factors[indicator_name]
            for indicator_name, indicator_value in risk_indicators.items()
        )

        # Adjust based on historical patterns if available
        if historical_data:
            historical_adjustment = self.calculate_historical_risk_adjustment(
                student_metrics, historical_data
            )
            weighted_risk = weighted_risk * (1 + historical_adjustment)

        # Determine risk level
        risk_level = self.categorize_risk_level(weighted_risk)

        return {
            'risk_score': min(weighted_risk, 1.0),
            'risk_level': risk_level,
            'primary_risk_factors': self.rank_risk_factors(risk_indicators),
            'intervention_recommendations': self.suggest_interventions(risk_indicators, risk_level),
            'confidence_score': self.calculate_prediction_confidence(student_metrics),
            'timeline_prediction': self.predict_intervention_timeline(weighted_risk),
            'success_probability': self.calculate_success_probability(weighted_risk)
        }

    def detect_engagement_decline(self, student_metrics):
        """Detect declining engagement patterns"""
        engagement_history = student_metrics.get('engagement_history', [])

        if len(engagement_history) < 7:  # Need at least a week of data
            return 0.3  # Moderate risk due to insufficient data

        # Calculate engagement trend over time
        recent_engagement = statistics.mean(engagement_history[-7:])  # Last week
        earlier_engagement = statistics.mean(engagement_history[-14:-7])  # Week before

        if len(engagement_history) >= 14:
            decline_rate = (earlier_engagement - recent_engagement) / earlier_engagement
        else:
            decline_rate = max(0, (0.7 - recent_engagement))  # Compare to expected baseline

        # Additional decline indicators
        session_frequency_decline = self.calculate_session_frequency_decline(student_metrics)
        interaction_quality_decline = self.calculate_interaction_quality_decline(student_metrics)

        decline_score = (
            decline_rate * 0.5 +
            session_frequency_decline * 0.3 +
            interaction_quality_decline * 0.2
        )

        return min(decline_score, 1.0)

    def suggest_interventions(self, risk_indicators, risk_level):
        """Generate specific intervention recommendations"""
        interventions = []

        # Sort risk factors by severity
        sorted_risks = sorted(risk_indicators.items(), key=lambda x: x[1], reverse=True)

        for risk_factor, severity in sorted_risks:
            if severity > 0.5:  # Only intervene for significant risks
                if risk_factor == 'declining_engagement':
                    interventions.extend([
                        {
                            'type': 'engagement',
                            'action': 'Personalized content recommendation',
                            'urgency': 'medium',
                            'description': 'Suggest activities aligned with student interests'
                        },
                        {
                            'type': 'engagement',
                            'action': 'Gamification boost',
                            'urgency': 'low',
                            'description': 'Introduce new badges or challenges'
                        }
                    ])

                elif risk_factor == 'increasing_cognitive_load':
                    interventions.extend([
                        {
                            'type': 'cognitive_support',
                            'action': 'Reduce task complexity',
                            'urgency': 'high',
                            'description': 'Break down complex tasks into smaller steps'
                        },
                        {
                            'type': 'cognitive_support',
                            'action': 'Provide scaffolding',
                            'urgency': 'medium',
                            'description': 'Add guided practice and examples'
                        }
                    ])

                elif risk_factor == 'social_isolation':
                    interventions.extend([
                        {
                            'type': 'social_support',
                            'action': 'Facilitate peer connections',
                            'urgency': 'medium',
                            'description': 'Assign collaborative activities or study groups'
                        },
                        {
                            'type': 'social_support',
                            'action': 'Teacher check-in',
                            'urgency': 'high',
                            'description': 'Schedule one-on-one conversation'
                        }
                    ])

        return interventions[:5]  # Limit to top 5 recommendations
```

### 2. Success Trajectory Prediction

Uses regression analysis to predict future performance.

```python
def predict_learning_outcomes(historical_data, prediction_horizon_days=30):
    """
    Uses regression analysis and time series forecasting to predict future performance

    Returns: Comprehensive future performance predictions
    """
    # Feature engineering from historical data
    features = extract_predictive_features(historical_data)

    # Time series analysis for trends
    engagement_trend = calculate_trend_slope(features['engagement_history'])
    performance_trend = calculate_trend_slope(features['performance_history'])
    xp_trend = calculate_trend_slope(features['xp_history'])

    # Seasonal pattern detection
    seasonal_patterns = detect_learning_cycles(historical_data)

    # Momentum indicators
    current_momentum = calculate_learning_momentum(features)

    # Predictive models
    predicted_metrics = {
        'expected_xp_gain': predict_xp_trajectory(features, prediction_horizon_days),
        'quest_completion_probability': predict_quest_success_rate(features),
        'engagement_forecast': predict_engagement_levels(features, seasonal_patterns),
        'skill_mastery_timeline': predict_skill_acquisition(features),
        'badge_earning_prediction': predict_badge_achievements(features),
        'risk_trajectory': predict_risk_evolution(features)
    }

    # Confidence intervals
    prediction_confidence = calculate_prediction_confidence(features, prediction_horizon_days)

    return {
        'predictions': predicted_metrics,
        'confidence_intervals': prediction_confidence,
        'key_assumptions': extract_prediction_assumptions(features),
        'monitoring_recommendations': suggest_monitoring_points(predicted_metrics)
    }

def extract_predictive_features(historical_data):
    """Extract features relevant for prediction from historical data"""
    features = {}

    # Time-based features
    features['engagement_history'] = [d.engagement_score for d in historical_data]
    features['performance_history'] = [d.performance_score for d in historical_data]
    features['xp_history'] = [d.xp_earned for d in historical_data]
    features['session_frequency'] = calculate_session_frequency_trend(historical_data)

    # Behavioral features
    features['consistency_score'] = calculate_consistency_score(historical_data)
    features['challenge_acceptance_rate'] = calculate_challenge_acceptance_trend(historical_data)
    features['help_seeking_pattern'] = analyze_help_seeking_evolution(historical_data)

    # Performance features
    features['improvement_rate'] = calculate_improvement_velocity(historical_data)
    features['skill_acquisition_rate'] = calculate_skill_learning_rate(historical_data)
    features['retention_stability'] = assess_knowledge_retention_stability(historical_data)

    # Context features
    features['recent_major_events'] = identify_significant_learning_events(historical_data)
    features['seasonal_performance'] = analyze_seasonal_performance_patterns(historical_data)

    return features

def predict_xp_trajectory(features, horizon_days):
    """Predict XP earning trajectory using trend analysis"""
    xp_history = features['xp_history']

    if len(xp_history) < 7:
        return {'daily_xp': 0, 'total_predicted': 0, 'confidence': 'low'}

    # Calculate recent XP earning rate
    recent_xp = xp_history[-7:]  # Last week
    daily_xp_rate = sum(recent_xp) / 7

    # Trend adjustment
    xp_trend = calculate_trend_slope(xp_history)
    trend_adjusted_rate = daily_xp_rate * (1 + xp_trend * 0.1)  # Moderate trend impact

    # Consistency factor
    consistency = features['consistency_score']
    consistency_adjusted_rate = trend_adjusted_rate * consistency

    # Seasonal adjustment
    seasonal_factor = get_seasonal_adjustment(features['seasonal_performance'])
    final_daily_rate = consistency_adjusted_rate * seasonal_factor

    # Calculate prediction
    total_predicted_xp = final_daily_rate * horizon_days

    # Confidence based on data quality and consistency
    confidence = calculate_xp_prediction_confidence(features)

    return {
        'daily_xp_rate': final_daily_rate,
        'total_predicted_xp': total_predicted_xp,
        'confidence_level': confidence,
        'factors': {
            'base_rate': daily_xp_rate,
            'trend_adjustment': xp_trend,
            'consistency_factor': consistency,
            'seasonal_factor': seasonal_factor
        }
    }
```

---

## Comparative Analytics

### 1. Peer Performance Contextualization

```python
def calculate_relative_performance(student_metrics, cohort_data):
    """
    Contextualizes individual performance within peer groups
    """
    percentiles = {}
    for metric_name, student_value in student_metrics.items():
        cohort_values = [peer[metric_name] for peer in cohort_data]
        percentile = stats.percentileofscore(cohort_values, student_value)
        percentiles[metric_name] = percentile

    return {
        'performance_percentiles': percentiles,
        'strengths': [metric for metric, percentile in percentiles.items() if percentile >= 75],
        'improvement_areas': [metric for metric, percentile in percentiles.items() if percentile <= 25],
        'peer_similarity_score': calculate_peer_similarity(student_metrics, cohort_data)
    }
```

### 2. Adaptive Benchmarking

```python
def create_adaptive_benchmarks(student_profile, historical_cohorts):
    """
    Creates personalized benchmarks based on similar student profiles
    """
    # Find students with similar starting conditions
    similar_students = find_similar_profiles(student_profile, historical_cohorts)

    # Calculate success patterns
    success_patterns = analyze_successful_trajectories(similar_students)

    return {
        'personalized_targets': calculate_realistic_goals(success_patterns),
        'milestone_predictions': predict_achievement_timeline(success_patterns),
        'optimal_challenge_level': determine_zone_of_proximal_development(student_profile)
    }
```

---

## AI-Powered Insight Generation

### 1. Pattern Recognition Engine

```python
class PatternRecognitionEngine:
    def identify_learning_patterns(self, student_data):
        """
        Uses unsupervised learning to find hidden patterns
        """
        # Clustering analysis
        behavior_clusters = self.perform_behavioral_clustering(student_data)

        # Anomaly detection
        unusual_patterns = self.detect_anomalies(student_data)

        # Sequence pattern mining
        learning_sequences = self.mine_learning_sequences(student_data)

        return {
            'behavioral_archetype': behavior_clusters,
            'anomalous_behaviors': unusual_patterns,
            'optimal_learning_sequences': learning_sequences
        }
```

### 2. Natural Language Insight Generation

```python
def generate_ai_insights(metrics_summary):
    """
    Creates human-readable insights from complex metrics
    """
    insight_prompts = {
        'performance_analysis': f"""
        Analyze this learning data and provide insights:
        - Cognitive Load Index: {metrics_summary['cognitive_load']}/100
        - Flow State Frequency: {metrics_summary['flow_frequency']}%
        - Bloom's Taxonomy Level: {metrics_summary['cognitive_level']}/6
        - Retention Score: {metrics_summary['retention_score']}%
        - Motivation Index: {metrics_summary['motivation']}/100
        - Risk Level: {metrics_summary['risk_level']}/100

        Provide specific, actionable insights about:
        1. Learning effectiveness
        2. Cognitive development patterns
        3. Risk factors and interventions
        4. Personalized recommendations
        """,

        'comparative_analysis': f"""
        Compare this student's performance to similar learners:
        {format_comparative_data(metrics_summary['peer_comparison'])}

        Identify relative strengths, growth opportunities, and realistic goals.
        """
    }

    return generate_openai_insights(insight_prompts)
```

---

## Implementation Strategy

### Phase 1: Foundation Metrics (Weeks 1-2)

```python
# Priority 1: Basic tracking infrastructure
PHASE_1_METRICS = [
    'session_duration',
    'interaction_frequency',
    'quest_completion_rate',
    'basic_engagement_score',
    'xp_earning_rate'
]

# Implementation steps:
# 1. Set up activity tracking in frontend
# 2. Create analytics database tables
# 3. Implement basic metric calculations
# 4. Create simple reporting dashboard
```

### Phase 2: Advanced Analytics (Weeks 3-4)

```python
# Priority 2: Cognitive and behavioral analysis
PHASE_2_METRICS = [
    'cognitive_load_index',
    'flow_state_detection',
    'attention_span_analysis',
    'learning_style_classification',
    'motivation_state_detection'
]

# Implementation steps:
# 1. Enhance activity tracking with detailed behavioral data
# 2. Implement cognitive load and flow state algorithms
# 3. Add learning style classification
# 4. Create motivation analysis
```

### Phase 3: Predictive Models (Weeks 5-6)

```python
# Priority 3: Risk assessment and prediction
PHASE_3_METRICS = [
    'risk_prediction_model',
    'success_trajectory_prediction',
    'early_warning_system',
    'intervention_recommendations'
]

# Implementation steps:
# 1. Implement risk assessment algorithms
# 2. Create predictive models for performance
# 3. Build early warning system
# 4. Design intervention recommendation engine
```

### Phase 4: AI Integration (Weeks 7-8)

```python
# Priority 4: AI-powered insights and recommendations
PHASE_4_FEATURES = [
    'natural_language_insights',
    'pattern_recognition',
    'personalized_recommendations',
    'adaptive_learning_paths'
]

# Implementation steps:
# 1. Integrate OpenAI API for insight generation
# 2. Implement pattern recognition algorithms
# 3. Create personalized recommendation system
# 4. Build adaptive learning path suggestions
```

---

## Technical Implementation Notes

### Data Collection Requirements

```javascript
// Frontend tracking example
const activityTracker = {
  trackInteraction: (type, duration, context) => {
    const data = {
      user_id: currentUser.id,
      interaction_type: type,
      duration_ms: duration,
      context: context,
      timestamp: new Date().toISOString(),
      session_id: getSessionId(),
    };

    sendToAnalytics(data);
  },
};
```

### Database Schema Extensions

```sql
-- Core analytics table
CREATE TABLE learning_analytics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    session_id VARCHAR(255),
    interaction_type VARCHAR(100),
    duration_ms INTEGER,
    context JSONB,
    timestamp TIMESTAMP,
    engagement_score DECIMAL(3,2),
    cognitive_load_score INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Computed metrics table
CREATE TABLE computed_metrics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    metric_name VARCHAR(100),
    metric_value DECIMAL(10,4),
    computation_date DATE,
    confidence_score DECIMAL(3,2),
    metadata JSONB
);
```

### AI Service Integration

```python
# AI service for generating insights
class AIInsightService:
    def __init__(self, api_key):
        self.client = OpenAI(api_key=api_key)

    async def generate_student_insights(self, metrics_data):
        prompt = self.create_insight_prompt(metrics_data)

        response = await self.client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=500
        )

        return self.parse_insights(response.choices[0].message.content)
```

---

## Key Benefits

### 🎯 **Educational Research-Based**

- Metrics grounded in cognitive science and educational psychology
- Self-Determination Theory for motivation analysis
- Flow theory for optimal learning state detection
- Bloom's Taxonomy for cognitive development tracking

### 🧠 **Advanced Analytics**

- Cognitive Load Theory implementation
- Ebbinghaus Forgetting Curve analysis
- Learning style classification using behavioral patterns
- Predictive risk assessment with intervention recommendations

### 🤖 **AI-Powered Insights**

- Natural language report generation
- Pattern recognition for hidden learning behaviors
- Personalized recommendations based on individual learning profiles
- Adaptive benchmarking against similar learner profiles

### 📊 **Actionable Intelligence**

- Early warning systems for at-risk students
- Specific intervention recommendations
- Confidence scoring for all predictions
- Timeline predictions for learning outcomes

This comprehensive analytics framework provides the foundation for creating sophisticated, AI-powered reports that go far beyond simple metrics to offer deep insights into student learning patterns and predictive analytics for educational success.

---

## Engagement Metric (Behavioral) – Research-Backed Formula

**ENGAGEMENT METRIC = (Active Days × 2) + (Quest Actions × 3) + (Badge Actions × 4) + (EXP Earned × 0.1) + (Interaction Diversity × 2) + (Session Consistency × 10)**

Where:

- **Active Days:** Number of days with at least one activity in the last N days (e.g., 14)
- **Quest Actions:** Number of quest-related actions (e.g., quest_started, quest_completed)
- **Badge Actions:** Number of badge-related actions (e.g., badge_earned)
- **EXP Earned:** Total EXP gained in the period
- **Interaction Diversity:** Number of unique action types performed
- **Session Consistency:** Ratio of active days to total days (e.g., 10/14 = 0.71)

**Score is capped at 100.**

### Research Basis

This metric is grounded in educational research:

- Fredricks, Blumenfeld, & Paris (2004): School engagement as frequency, diversity, and consistency of participation.
- You (2016): LMS log indicators—login frequency, activity diversity, submissions, forum posts—predict achievement.
- Henrie, Halverson, & Graham (2015): Log data for active days, action diversity, and meaningful participation.

**References:**

- Fredricks, J. A., Blumenfeld, P. C., & Paris, A. H. (2004). School Engagement: Potential of the Concept, State of the Evidence. Review of Educational Research, 74(1), 59–109. [doi:10.3102/00346543074001059](https://doi.org/10.3102/00346543074001059)
- You, J. W. (2016). Identifying significant indicators using LMS data to predict course achievement in online learning. The Internet and Higher Education, 29, 23–30. [doi:10.1016/j.iheduc.2015.11.003](https://doi.org/10.1016/j.iheduc.2015.11.003)
- Henrie, C. R., Halverson, L. R., & Graham, C. R. (2015). Measuring student engagement in technology-mediated learning: A review. Computers & Education, 90, 36–53. [doi:10.1016/j.compedu.2015.09.005](https://doi.org/10.1016/j.compedu.2015.09.005)

---
