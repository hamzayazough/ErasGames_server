# Daily Quiz Engine Testing Guide

This guide provides comprehensive Postman requests to test the entire daily quiz engine, including composition, template warmup, and the complete automated workflow.

## Prerequisites

- Server running on `http://localhost:3000` (or your configured port)
- Database properly set up with question data
- Admin endpoints accessible

## Testing Flow Overview

1. **System Health Check** - Verify system is ready
2. **Question Pool Validation** - Check available questions
3. **Preview Composition** - Test logic without creating records
4. **Manual Composition** - Create actual quiz (T-60m simulation)
5. **Template Warmup** - Upload templates (T-5m simulation)
6. **Job Status Monitoring** - Check automated job scheduling
7. **Complete Workflow Test** - End-to-end validation

---

## 1. System Health Check

### Check Composition System Health

```http
GET /admin/daily-quiz/health
Host: localhost:3000
Content-Type: application/json
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "healthy": true,
    "issues": [],
    "recommendations": [],
    "lastCheck": "2025-09-18T10:00:00.000Z",
    "questionPoolStats": {
      "totalQuizzes": 5,
      "byDifficulty": {
        "easy": 25,
        "medium": 15,
        "hard": 8
      }
    },
    "recentCompositions": []
  },
  "message": "Composition system is healthy"
}
```

---

## 2. Question Pool Validation

### Get Question Availability

```http
GET /admin/daily-quiz/availability
Host: localhost:3000
Content-Type: application/json
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "totalQuizzes": 5,
    "averageRelaxationLevel": 0,
    "themeDistribution": {},
    "recentWarnings": [],
    "byDifficulty": {
      "easy": 25,
      "medium": 15,
      "hard": 8
    }
  },
  "message": "Question availability retrieved successfully"
}
```

### Get Configuration Options

```http
GET /admin/daily-quiz/options
Host: localhost:3000
Content-Type: application/json
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "modes": ["MIX", "SPOTLIGHT", "EVENT"],
    "themes": ["Lyrics", "Albums", "Timeline", "Audio", "Songs", "Career"],
    "defaultConfig": {
      "targetQuestionCount": 6,
      "difficultyDistribution": {
        "easy": 3,
        "medium": 2,
        "hard": 1
      }
    }
  },
  "message": "Composition options retrieved successfully"
}
```

---

## 3. Preview Composition (Safe Testing)

### Preview MIX Mode Quiz

```http
POST /admin/daily-quiz/preview
Host: localhost:3000
Content-Type: application/json

{
  "dropAtUTC": "2025-09-19T17:00:00.000Z",
  "mode": "MIX"
}
```

### Preview SPOTLIGHT Mode Quiz

```http
POST /admin/daily-quiz/preview
Host: localhost:3000
Content-Type: application/json

{
  "dropAtUTC": "2025-09-19T17:00:00.000Z",
  "mode": "SPOTLIGHT"
}
```

### Preview with Custom Configuration

```http
POST /admin/daily-quiz/preview
Host: localhost:3000
Content-Type: application/json

{
  "dropAtUTC": "2025-09-19T17:00:00.000Z",
  "mode": "MIX",
  "config": {
    "targetQuestionCount": 4,
    "difficultyDistribution": {
      "easy": 2,
      "medium": 1,
      "hard": 1
    }
  }
}
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "previewMode": true,
    "dropAtUTC": "2025-09-19T17:00:00.000Z",
    "mode": "MIX",
    "themePlan": {
      "mode": "MIX",
      "themes": ["Lyrics", "Albums", "Timeline"]
    },
    "estimatedQuestions": 6,
    "difficultyDistribution": {
      "easy": 3,
      "medium": 2,
      "hard": 1
    },
    "availableQuestions": {
      "easy": 25,
      "medium": 15,
      "hard": 8
    },
    "warnings": ["This is a preview - no records will be created"],
    "feasible": true
  },
  "message": "Preview generated successfully"
}
```

---

## 4. Manual Composition Testing (T-60m Simulation)

### Create Daily Quiz via Composer Service

```http
POST /admin/daily-quiz/compose
Host: localhost:3000
Content-Type: application/json

{
  "dropAtUTC": "2025-09-19T17:00:00.000Z",
  "mode": "MIX"
}
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "quizId": "uuid-quiz-id",
    "questionCount": 6,
    "template": {
      "version": 1,
      "cdnUrl": null,
      "size": 2048
    },
    "composition": {
      "relaxationLevel": 0,
      "themeDistribution": {
        "Lyrics": 2,
        "Albums": 2,
        "Timeline": 2
      },
      "difficultyActual": {
        "easy": 3,
        "medium": 2,
        "hard": 1
      },
      "warnings": [],
      "performanceMs": 150
    }
  },
  "message": "Successfully composed daily quiz for 2025-09-19T17:00:00.000Z"
}
```

### Create Daily Quiz via Job Processor

```http
POST /admin/daily-quiz/jobs/trigger-composition
Host: localhost:3000
Content-Type: application/json

{
  "dropAtUTC": "2025-09-20T17:00:00.000Z"
}
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Daily composition job triggered successfully for 2025-09-20T17:00:00.000Z"
}
```

---

## 5. Template Warmup Testing (T-5m Simulation)

### Check Recent Compositions to Get Quiz ID

```http
GET /admin/daily-quiz/logs?limit=5&offset=0
Host: localhost:3000
Content-Type: application/json
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "uuid-quiz-id",
        "dropAtUTC": "2025-09-19T17:00:00.000Z",
        "mode": "MIX",
        "themePlan": ["Lyrics", "Albums", "Timeline"],
        "questionCount": 6,
        "createdAt": "2025-09-18T16:00:00.000Z",
        "templateCdnUrl": null
      }
    ],
    "pagination": {
      "total": 1,
      "limit": 5,
      "offset": 0
    }
  },
  "message": "Composition logs retrieved successfully"
}
```

### Trigger Template Warmup

```http
POST /admin/daily-quiz/jobs/trigger-warmup
Host: localhost:3000
Content-Type: application/json

{
  "quizId": "uuid-quiz-id"
}
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Template warmup job triggered successfully for quiz uuid-quiz-id"
}
```

### Verify Template URL was Set

```http
GET /admin/daily-quiz/logs?limit=1&offset=0
Host: localhost:3000
Content-Type: application/json
```

**Expected Response (after warmup):**

```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "uuid-quiz-id",
        "dropAtUTC": "2025-09-19T17:00:00.000Z",
        "mode": "MIX",
        "themePlan": ["Lyrics", "Albums", "Timeline"],
        "questionCount": 6,
        "createdAt": "2025-09-18T16:00:00.000Z",
        "templateCdnUrl": "https://cdn.example.com/templates/uuid-quiz-id-v1.json"
      }
    ]
  },
  "message": "Composition logs retrieved successfully"
}
```

---

## 6. Job Status Monitoring

### Check Automated Job Status

```http
GET /admin/daily-quiz/jobs/status
Host: localhost:3000
Content-Type: application/json
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "composer": {
      "lastRun": null,
      "nextRun": "2025-09-19T16:00:00.000Z",
      "status": "scheduled"
    },
    "template": {
      "lastRun": null,
      "nextRun": "2025-09-18T16:55:00.000Z",
      "status": "scheduled"
    }
  },
  "message": "Job status retrieved successfully"
}
```

---

## 7. Complete Workflow Testing

### Test Full Workflow (Composition Only)

```http
POST /admin/daily-quiz/jobs/test-workflow
Host: localhost:3000
Content-Type: application/json

{
  "dropAtUTC": "2025-09-21T17:00:00.000Z",
  "mode": "MIX"
}
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Composition completed for 2025-09-21T17:00:00.000Z. Use the quiz ID from the logs endpoint to trigger warmup manually.",
  "nextSteps": [
    "1. Call GET /admin/daily-quiz/logs to find the quiz ID",
    "2. Call POST /admin/daily-quiz/jobs/trigger-warmup with the quiz ID",
    "3. Verify templateCdnUrl is set in the quiz record"
  ]
}
```

---

## 8. Error Testing Scenarios

### Test Duplicate Quiz Creation

```http
POST /admin/daily-quiz/compose
Host: localhost:3000
Content-Type: application/json

{
  "dropAtUTC": "2025-09-19T17:00:00.000Z",
  "mode": "MIX"
}
```

**Expected Response (if quiz already exists):**

```json
{
  "success": false,
  "error": "Failed to compose daily quiz: Daily quiz already exists for 2025-09-19T17:00:00.000Z"
}
```

### Test Invalid Date Format

```http
POST /admin/daily-quiz/compose
Host: localhost:3000
Content-Type: application/json

{
  "dropAtUTC": "invalid-date",
  "mode": "MIX"
}
```

**Expected Response:**

```json
{
  "success": false,
  "error": "Invalid dropAtUTC format. Use ISO 8601 format."
}
```

### Test Warmup on Non-existent Quiz

```http
POST /admin/daily-quiz/jobs/trigger-warmup
Host: localhost:3000
Content-Type: application/json

{
  "quizId": "non-existent-id"
}
```

**Expected Response:**

```json
{
  "success": false,
  "error": "Failed to trigger template warmup job: Quiz not found: non-existent-id"
}
```

### Test Warmup on Already Warmed Quiz

```http
POST /admin/daily-quiz/jobs/trigger-warmup
Host: localhost:3000
Content-Type: application/json

{
  "quizId": "already-warmed-quiz-id"
}
```

**Expected Behavior:** Should skip warmup and log that template already exists.

---

## 9. Testing the Fix (Option 2 Implementation)

### Verify T-60m Behavior (No CDN URL Set)

1. Create quiz via composition
2. Check logs - `templateCdnUrl` should be `null`
3. Verify template content exists but URL is not set

### Verify T-5m Behavior (CDN URL Set After Upload)

1. Trigger warmup on quiz with `templateCdnUrl: null`
2. Check logs - `templateCdnUrl` should now be populated
3. Trigger warmup again - should skip with "already uploaded" message

### Verify End-to-End Flow

1. Composition → `templateCdnUrl: null`
2. Warmup → `templateCdnUrl: "https://..."`
3. Second warmup → Skipped (already exists)

---

## 10. Production Readiness Validation

### High Volume Testing

Create multiple quizzes for different dates:

```http
POST /admin/daily-quiz/compose
Host: localhost:3000
Content-Type: application/json

{
  "dropAtUTC": "2025-09-22T17:00:00.000Z",
  "mode": "SPOTLIGHT"
}
```

### Performance Testing

Monitor response times for:

- Composition (should be < 1000ms)
- Template warmup (should be < 2000ms)
- Health checks (should be < 100ms)

### Edge Case Testing

- Quiz creation near midnight UTC
- Special event dates (Dec 13 - Taylor's birthday)
- Different quiz modes and configurations
- Maximum and minimum question counts

---

## Troubleshooting Common Issues

### Quiz Creation Fails

1. Check question pool availability
2. Verify database connectivity
3. Check composition logs for warnings

### Template Warmup Fails

1. Verify quiz exists and has questions
2. Check CDN/storage configuration
3. Ensure template service is properly configured

### Cron Jobs Not Running

1. Check job status endpoint
2. Verify timezone calculations
3. Check server logs for cron execution

---

## Expected Log Outputs

When testing, monitor server logs for these messages:

**Composition Success:**

```
[DailyQuizComposerService] Starting daily quiz composition for 2025-09-19T17:00:00.000Z
[DailyQuizComposerService] Successfully composed daily quiz uuid-quiz-id with 6 questions (relaxation level: 0)
```

**Warmup Success:**

```
[DailyQuizJobProcessor] Manual template warmup trigger requested for quiz uuid-quiz-id
[DailyQuizJobProcessor] Manual template warmup completed: https://cdn.example.com/templates/uuid-quiz-id-v1.json (v1)
```

**Warmup Skip (Already Exists):**

```
[DailyQuizJobProcessor] Template already uploaded for quiz uuid-quiz-id: https://cdn.example.com/templates/uuid-quiz-id-v1.json
```
