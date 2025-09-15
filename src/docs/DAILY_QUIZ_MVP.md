# Daily Quiz Engine - Minimum Playable Slice

This implementation provides the core functionality for the Daily Quiz Engine MVP, enabling a single timezone demo (America/Toronto) with the complete quiz flow.

## ✅ Implemented Features

### API Endpoints

#### `GET /daily`

- Returns today's DailyQuiz for America/Toronto timezone
- Includes template URL, timing windows, and quiz metadata
- **Status**: ✅ Complete

#### `POST /attempts/start`

- Creates a new attempt for the user
- Validates join window and prevents duplicate attempts
- Returns attempt ID, deadline (10 minutes), and template URL
- **Status**: ✅ Complete

#### `POST /attempts/:id/answer`

- Accepts answer submissions with idempotency protection
- Validates question belongs to quiz and deadline hasn't passed
- **Status**: ✅ Complete

#### `POST /attempts/:id/finish`

- Computes final score using the specified formula
- Provides detailed breakdown and question results
- Fully idempotent (returns same result on repeat calls)
- **Status**: ✅ Complete

### Scoring Formula

```
base = 100
accuracyBonus = 25 * (accPoints / 10)
speedBonus = 25 * (1 - finishTimeSec / 600)   // clamped 0..25
earlyBonus = 0
score = round(base + accuracyBonus + speedBonus + earlyBonus)
```

### Background Jobs (Cron-based)

#### `composer:daily` (T-60m)

- Runs daily at 11:00 AM Toronto time
- Selects 6 questions (3 easy, 2 medium, 1 hard)
- Implements anti-repeat logic (7+ day avoidance)
- Creates DailyQuiz and DailyQuizQuestion records
- **Status**: ✅ Complete

#### `warmup:template` (T-5m)

- Runs daily at 11:55 AM Toronto time
- Builds CDN JSON template (answer-free)
- Simulates S3/CDN upload for MVP
- Updates quiz with templateCdnUrl
- **Status**: ✅ Complete

### Database Schema

#### Core Tables

- `daily_quiz` - Quiz metadata and drop times
- `daily_quiz_question` - Question associations with ordering
- `attempt` - User attempts with timing and scoring
- `attempt_answer` - Individual answer submissions with idempotency
- **Status**: ✅ Complete

#### Performance Indexes

- Question selection optimization: `(last_used_at, difficulty, exposure_count)`
- Attempt lookup: `(user_id, daily_quiz_id)` unique constraint
- Daily quiz timing: `(drop_at_utc)`
- Answer idempotency: `(idempotency_key)` unique
- **Status**: ✅ Complete

### Template CDN System

- Generates answer-free JSON for client consumption
- Includes client shuffle configuration
- Mock CDN implementation for MVP (extensible to S3/CloudFront)
- **Status**: ✅ Complete

## 🧪 Test Coverage

### E2E Tests (`test/daily-quiz-system.e2e-spec.ts`)

- ✅ GET /daily returns valid quiz data
- ✅ GET /daily handles missing quiz (404)
- ✅ GET /daily handles template not ready (503)
- ✅ POST /attempts/start creates attempt successfully
- ✅ POST /attempts/start prevents duplicate attempts (409)
- ✅ POST /attempts/:id/answer accepts submissions
- ✅ POST /attempts/:id/answer is idempotent
- ✅ POST /attempts/:id/answer rejects after deadline (422)
- ✅ POST /attempts/:id/finish computes score correctly
- ✅ POST /attempts/:id/finish is idempotent
- ✅ POST /attempts/:id/finish rejects after deadline (422)

### Unit Tests (`src/controllers/attempts.controller.spec.ts`)

- ✅ Scoring formula validation
- ✅ Answer correctness validation

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- TypeScript

### Installation

```bash
npm install
```

### Database Setup

```bash
# Run migration files in order:
psql -d erasgames -f db/01_init_tables.sql
psql -d erasgames -f db/02_questions.sql
psql -d erasgames -f db/03_daily_quiz.sql
psql -d erasgames -f db/04_attempt.sql
psql -d erasgames -f db/16_attempt_answer.sql
psql -d erasgames -f db/17_quiz_system_indexes.sql
```

### Environment Variables

```bash
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=erasgames
DB_PASSWORD=password
DB_NAME=erasgames
CDN_BASE_URL=https://cdn.erasgames.com
```

### Running the Application

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

### Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📋 Acceptance Criteria Status

### ✅ Core Flow

- [x] `/daily` returns valid templateUrl for today
- [x] `/attempts/start` creates exactly one active attempt per user/day
- [x] Client can download template JSON and render 6 questions
- [x] `/answer` accepts submissions and is idempotent
- [x] `/finish` computes score before deadline
- [x] Re-calling `/finish` returns same result (idempotent)
- [x] After deadline, `/answer` and `/finish` return 422 WINDOW_EXPIRED

### ✅ Background Jobs

- [x] `composer:daily` picks 6 questions with anti-repeat logic
- [x] `warmup:template` builds and uploads CDN templates
- [x] Jobs run on schedule (T-60m and T-5m)

### ✅ Admin Endpoints

- `POST /admin/jobs/composer/trigger` - Manual composition
- `POST /admin/jobs/template/trigger` - Manual template build
- `GET /admin/jobs/status` - Job status monitoring

## 🎯 MVP Scope

### ✅ In Scope

- Single timezone support (America/Toronto)
- Happy path quiz flow
- Server-side answer validation
- 10-minute attempt window
- Basic scoring with speed bonus
- Anti-repeat question selection
- Template CDN delivery

### ❌ Out of Scope (Future)

- Multi-timezone support
- Leaderboards
- Billing, retries, hints, restart logic
- Advanced jitter fairness / early bonus
- Real-time multiplayer features
- Advanced question types

## 🏗️ Architecture

### NestJS Structure

```
src/
├── controllers/
│   ├── daily-quiz.controller.ts      # GET /daily
│   └── attempts.controller.ts        # Attempt endpoints
├── admin/controllers/
│   └── admin-job.controller.ts       # Job management
├── services/
│   └── daily-quiz-job-processor.service.ts  # Background jobs
└── database/
    ├── entities/                     # TypeORM entities
    └── services/daily-quiz-composer/ # Quiz composition logic
```

### Database Design

- **Partitioning-ready**: Attempts can be partitioned by month
- **Performance-optimized**: Comprehensive indexing strategy
- **Audit-friendly**: Immutable attempt_answer records
- **Scalable**: Question pool designed for high-volume selection

## 🔧 Admin Tools

Access admin endpoints at:

- `GET /admin/jobs/status` - Monitor job health
- `POST /admin/jobs/composer/run` - Force daily composition
- `POST /admin/jobs/template/run` - Force template generation
- `GET /admin/daily-quiz/stats` - Composition statistics

## 📈 Monitoring

Key metrics to track:

- Daily quiz composition success rate
- Template generation latency
- Attempt completion rate
- Average quiz completion time
- Question selection diversity

## 🛠️ Development Notes

### Mock CDN Implementation

For MVP, templates are "uploaded" to a simulated CDN. To integrate with real S3/CloudFront:

1. Install AWS SDK: `npm install @aws-sdk/client-s3`
2. Update `TemplateService.simulateCdnUpload()` with real S3 upload
3. Configure CloudFront distribution
4. Update `CDN_BASE_URL` environment variable

### Question Pool Requirements

Ensure sufficient questions in database:

- Minimum 50+ easy questions
- Minimum 30+ medium questions
- Minimum 15+ hard questions
- Various themes for diversity

This ensures anti-repeat logic has sufficient options at all relaxation levels.
