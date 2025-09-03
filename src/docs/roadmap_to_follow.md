# Next Steps for Eras Quiz Server (NestJS)

## P0 — Content Pipeline

### 1. Foundational Question Management

- **`QuestionsService`**: Implement an internal-facing CRUD service for creating, reading, updating, and disabling questions.
- **Support for Question Types**: Implement server-side logic and validation for at least 2-3 diverse question types (e.g., `BasicAnswer`, `FillBlankAnswer`, `AiVisualAnswer`) to establish a scalable pattern.
- **Admin Endpoints**: Expose basic admin endpoints for question management. Initially, these can be simple, secured API endpoints.
- ✅ **Acceptance**: Questions can be successfully created and retrieved via API; the data structure is confirmed to support all 19 question variations.

## P1 — Critical: Daily Quiz Engine

### 1. Daily Quiz Engine

**ComposerService**

- Implement `pickWithRelaxation()` (30→21→14→10→7) with exposure bias.
- ✅ **Acceptance:** generates 6 Q (3E/2M/1H), no repeats under 7 days, logs daily quiz plan.

**TemplateWarmupService**

- Precompute CDN JSON (no answers), signed S3 URL, versioned.
- ✅ **Acceptance:** `GET /daily` returns a valid template URL ~5 minutes before drop.

**AttemptsService**

- `POST /attempts/start`: enforce “1 active/day”, return `{ seed, deadline, assignedJitterSec }`.
- ✅ **Acceptance:** deadline = 600s + entitlement, rejects attempts after join window.

### 2. Entitlements & Local-Time Fairness

**EntitlementsService**

- Grant entitlements at drop: calculate `extraTimeSec`, `retries`, `practice`, and `assignedJitterSec`.
- ✅ **Acceptance:** stored in `daily_entitlements`, consumed at runtime (`/retry`, `/hint`, `/restart`).

**TZ/Drop Service**

- Implement per-TZ drop minute + deterministic per-user jitter.
- ✅ **Acceptance:** `daily_drop_tz` populated; jitter fairness applied in scoring.

### 3. Scoring Engine

- Compute `score = base + accuracy + speed + earlyBonus` (with jitter adjustment).
- ✅ **Acceptance:**
  - Speed bonus normalized to 600s (not affected by extra time).
  - Early bonus = `(startAt - tzDropAt - jitter)`.
  - Hints penalize weight.
  - Only last finished attempt counts after restart.

## P2 — Billing & Monetization

**Webhook Processor**

- Insert `BillingEvent`, derive subscription state, create `ProviderTransaction` if financial.
- ✅ **Acceptance:** Stripe + Apple + Google sandbox events processed idempotently.

**Entitlement Grant Hook**

- On drop, read active subscription/one-offs → populate `daily_entitlements`.

**Purchase Fulfillment**

- Hints/restarts granted via webhook → mark fulfilled.

## P3 — Leaderboards

**Realtime Updates**

- On finish: `ZADD` daily, `ZINCRBY` season/theme.
- Keep only highest daily score per user.

**Snapshot Jobs**

- Hourly/daily → persist `leaderboard_snapshot`.
- ✅ **Acceptance:** `GET /leaderboards?scope=daily` returns consistent ranking; tie-breaking documented.

## P4 — Admin / Ops

- Daily quiz override.
- Partition management endpoints (`/admin/partitions`).
- Stats: DAU, start/finish %, avg score, item analysis.

## P5 — Observability & Reliability

**Monitoring**

- OpenTelemetry traces, metrics (p95 latencies, queue backlogs).

**Health checks**

- Partition health, Redis connection, billing webhooks.

**Alerts**

- On SLO breach, webhook backlog, entitlement grant failures.

## P6 — Security & Anti-Cheat

- Deterministic shuffle verification (seed + option order hash).
- Device integrity hints (root/jailbreak).
- Rate limiting & WAF rules.
- Replay protection (idempotency keys).

## ✅ Suggested Development Order

1.  **Content Pipeline** (Question service, initial types, admin endpoints)
2.  **Daily Engine** (composer, template, attempts, scoring)
3.  **Entitlements + fairness** (jitter, extra time)
4.  **Billing webhook → entitlement grant**
5.  **Leaderboards** (Redis + snapshot jobs)
6.  **Admin Ops & Moderation Tools**
7.  **Observability + security hardening**
