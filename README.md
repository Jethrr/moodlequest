# MoodleQuest 🎮📚

_A Gamified Engagement System for Asynchronous Learning_

## 📌 Overview

MoodleQuest is a gamified system designed to enhance student engagement, motivation, and progress tracking in text-based asynchronous learning environments. By integrating quests, rewards, leaderboards, and real-time analytics into Moodle, MoodleQuest transforms passive learning into a dynamic and rewarding experience for students, educators, and institutions.

---

## 🚨 Problem Statement

Asynchronous learning offers flexibility but often suffers from poor student engagement, procrastination, and lack of motivation. Traditional LMS platforms lack features for real-time engagement insights, personalization, and gamified incentives.

---

## ✅ Proposed Solution

MoodleQuest addresses these issues by:

- Integrating gamification (EXP, badges, leaderboards, virtual pets).
- Providing real-time dashboards for both students and instructors.
- Allowing custom quests and validation tasks for learning reinforcement.
- Enabling actionable analytics to guide intervention and support.

---

## 🎯 SMART Objectives

### Main Goals

- **Secure Authentication** using Moodle SSO with role-based access (RBAC).
- **Boost Engagement** through EXP-based gamification and badges.
- **Validate Learning** via quests, missions, and challenge-based tasks.
- **Improve Tracking** with real-time dashboards for students and teachers.

### Specific Deliverables

- Moodle API integration with secure login & profile management.
- Gamification elements: EXP, badges, streaks, leaderboards, and pets.
- Quest system: custom missions with validation and progress rewards.
- Dashboards: visual study trends, heatmaps, and engagement metrics.

---

## 🌟 Key Features

- 🎮 **Gamified System**: EXP, evolving virtual pets, and badges.
- 🧭 **Quests & Missions**: Daily/weekly learning tasks with challenges.
- 🏆 **Achievements**: Streaks, performance awards, and consistency badges.
- 📊 **Leaderboard**: Friendly competition to highlight top performers.
- 📈 **Real-Time Dashboards**: Engagement heatmaps and activity tracking.
- 🔍 **Advanced Analytics**: AI-powered learning insights and predictive modeling.
- 🎯 **Retroactive Rewards**: Automated badge awarding for past achievements.

---

## 👥 Target Users

- **Students**: Stay motivated with rewards, track progress, and build habits.
- **Teachers**: Monitor engagement, assign quests, and give feedback.
- **Schools**: Improve learning outcomes with data-driven insights.
- **Parents**: Gain visibility into student participation and progress.

---

## 🛠️ Technologies Used

### Frontend

- **NextJS**, **TypeScript**, **TailwindCSS**
- **AMD & jQuery** for Moodle compatibility

### Backend

- **FastAPI** with Python for core API services
- **SQLAlchemy** for database ORM and migrations
- **PostgreSQL** for primary data storage
- **Moodle Database API** for secure data transactions
- **REST APIs** and backup DB for auxiliary data
- **Prisma** for additional database management

### Project Management

- **ClickUp/Jira** for Agile planning (Scrum – 4 sprints)
- **Slack/Discord** for team collaboration

---

## 🔒 Security & Infrastructure

- HTTPS with SSL/TLS
- Multi-Factor Authentication (MFA) for admin accounts
- Rate limiting, input validation, and secure CORS headers
- Role-based access control (RBAC)

---

## 📈 Evaluation Metrics

- **System Uptime** ≥ 99.9%
- **Response Time** < 200ms
- **User Retention & Engagement** tracked via DAU/MAU
- **Feature Utilization**: EXP system, quests, leaderboards, badges
- **Security Incident Rate** < 1%
- **Badge Award Accuracy** ≥ 95% for retroactive and real-time awards
- **Analytics Prediction Accuracy** ≥ 80% for learning outcome predictions

---

## 🧪 Testing Strategy

- **Unit Testing**: `Jest` for frontend, `pytest` for backend
- **Integration Testing**: Manual + NextJS tools + FastAPI test client
- **Performance Testing**: `JMeter` for load testing
- **User Acceptance Testing (UAT)**: Feedback from pilot users
- **Badge System Testing**: Automated tests for retroactive badge awarding
- **Analytics Validation**: Statistical verification of learning metrics

---

## 📚 References

Research-backed design from:

- Wakjira & Bhattacharya (2022)
- Ang et al. (2024)
- Kim et al. (2023)
- Porter & Bozkaya (2020)
- Doboli et al. (2022)

---

## 🤝 Call to Action

We seek support and approval to proceed with development, deployment, and user onboarding. Help us transform asynchronous education into a more **engaging**, **adaptive**, and **rewarding** experience.

> Built by Group 6 (Cebu Institute of Technology - University)  
> Binangbang, Bitayo, Floreta, Omictin | Adviser: Mr. Jay Vince Serato

---

## 🚀 Recent Development Updates

### Badge System Enhancements (Latest)

- **Fixed Badge Display Issues**: Resolved user ID mapping problems between Moodle and internal systems
- **Retroactive Badge Awarding**: Implemented automated system to award badges for past quest completions
- **Improved Badge Collection**: Enhanced frontend badge display and real-time updates
- **Debug Tools**: Added comprehensive badge debugging panel for development

### Advanced Learning Analytics Framework

- **Research-Based Metrics**: Implemented 15+ advanced learning analytics metrics based on educational research
- **AI-Powered Insights**: Designed algorithms for predictive modeling and personalized learning recommendations
- **Teacher Reporting**: Comprehensive analytics dashboard framework for educators
- **Performance Tracking**: Advanced engagement pattern analysis and intervention triggers

### System Optimizations

- **Code Cleanup**: Identified and removed unused files to improve maintainability
- **Documentation**: Created detailed guides for badge troubleshooting and analytics implementation
- **Testing Suite**: Enhanced test coverage for badge and user systems

For detailed technical information, see:

- `BADGE_TROUBLESHOOTING.md` - Badge system debugging guide
- `ADVANCED_LEARNING_ANALYTICS.md` - Comprehensive analytics framework
- `IMPLEMENTATION_SUMMARY.md` - Recent development summary
- `UNUSED_FILES_REPORT.md` - Code cleanup documentation

---

## 🚀 Quick Start

### Prerequisites

- Python 3.8+ for backend
- Node.js 18+ for frontend
- PostgreSQL database
- Moodle instance for SSO integration

### Installation

#### Backend Setup

```bash
cd backend
pip install -r requirements.txt
# Configure database connection in .env
alembic upgrade head
python main.py
```

#### Frontend Setup

```bash
cd frontend
npm install
# Configure environment variables
npm run dev
```

#### Retroactive Badge Setup

```bash
cd backend
python retroactive_badge_award.py --dry-run  # Test first
python retroactive_badge_award.py  # Award badges
```

For detailed setup instructions and troubleshooting, see the documentation files in the project root.

---
