Taylor swift inspired app

Eras Quiz — Architecture & SRS (Updated for US/EU/CA/AU Local-Time Drops)
Version 1.1 • September 2025 • Timezone-aware • Target platforms: US / EU / CA / AU

---

0. Executive Summary
   Eras Quiz is a mobile-first, competitive daily quiz for Taylor Swift fans with a BeReal-style global mechanic: every day, at a random time in each player’s local evening window, users get a push (“It’s Era Time!”). They have 1 hour to press Start and 10 minutes to finish 6 questions (3 easy, 2 medium, 1 hard) chosen from 19 supported question types. Scores depend on accuracy, finish speed, and how early a player starts within the join window. There are global, seasonal, daily, regional, and themed leaderboards. Subscriptions and one-offs enable extra time, retries, hints, practice mode, and quiz restart.
   Stack: React Native app (players), Next.js admin, NestJS API, Postgres (primary), Redis (LBs/cache/queues), BullMQ (jobs), S3 + CDN (media + daily template), FCM/APNs (push), Stripe (billing). Designed to handle 10k–50k players in the same hour across supported regions.
   New in v1.1: Follow-the-sun local-time drops for US/EU/CA/AU. Daily push occurs between 18:00–22:00 local time (configurable per user/TZ) with jitter fairness baked into scoring so no one is penalized by later delivery.

---

1. Goals & Non-Goals
   Goals
   • Scalable daily drop for 10k–50k concurrent users/hour across US/EU/CA/AU.
   • Local-time evening drops; configurable per-user window (e.g., 17:00–21:00), with guardrails.
   • Fun, fair scoring with jitter-adjusted early bonus.
   • 19 question types with typed schemas & responses.
   • Anti-repeat question composition and anti-cheat.
   • Subscriptions (Basic/Premium) + one-offs (restart/hints) via Stripe.
   • Robust leaderboards (global/daily/season/theme/region).
   • Strong admin CMS and moderation.
   • Legal/IP guardrails (no portrait/logo/masters; era-inspired assets only).
   Non-Goals (v1)
   • Real-time PvP head-to-head.
   • In-app chat/social feed.
   • Web gameplay parity (primary experience is mobile).

---

2. Glossary
   • Daily Drop: the minute within the local evening window when the quiz becomes available.
   • Join Window: 1 hour after drop when a user may press Start.
   • Attempt: a user’s daily run; a restart consumes a token to try again.
   • Template: precomputed quiz JSON (no answers) published to CDN.
   • Entitlements: daily grants derived from subscription & purchases (extra time, retries, etc.).
   • Jitter: 0–90 s randomized delivery delay to smooth push spikes.

---

3. Personas
   • Player: Swiftie seeking daily challenge and fair leaderboards.
   • Admin/Editor: curates content, schedules daily sets, moderates.
   • Engineer/Analyst: ensures resilience, telemetry, and data quality.

---

4. System Context (High Level)
   • Mobile App (React Native) ↔ NestJS API
   • Admin (Next.js) ↔ NestJS Admin API
   • NestJS ↔ Postgres (state) | Redis (LBs/cache/queues) | S3+CDN (media/template)
   • Push: FCM/APNs topics per TZ or per bucket
   • Stripe: subscriptions & one-offs via webhook → entitlements

---

5. Functional Overview
   Core Loop

1) For each TZ (or per-user), pick a random minute within 18:00–22:00 local.
2) Send push with ±0–90 s jitter to flatten spikes.
3) Player has 1 hour to press Start. Server stamps serverStartAt and deadline = 600s + extraTime.
4) Player answers 6 questions in up to 10:00 base (12:00 Basic, 14:00 Premium).
5) Server computes score with accuracy + speed (normalized to 10:00) + early bonus (jitter-adjusted). LBs update.
   Scoring (unchanged baseline + jitter fairness)
   base = 100
   accuracy_bonus = 25 _ (acc_points / 10) // weights: easy=1, medium=2, hard=3 (max 10)
   speed_bonus = 25 _ (1 - finish_time / 600) // ALWAYS normalize to 10:00
   effective_start_delay = max(0, (startAt - tzDropAt) - assignedJitterSec)
   early_bonus = 50 \* (1 - effective_start_delay / 3600)
   score = round(base + accuracy_bonus + speed_bonus + early_bonus)
   • Extra time helps thinking but not the speed bonus.
   • Early bonus uses jitter-adjusted delay so later delivery isn’t a penalty.
   • Hints reduce that item’s weight (e.g., −20%).
   • Retries: last answer only; no extra bonus.
   • Restart: only the latest finished attempt counts.
   Question Types (19)
6) Album Year Guess
7) Song ↔ Album Match
8) Fill in the Blank (with choices)
9) Guess the Song by the Lyric
10) Odd One Out
11) AI-Generated Aesthetic Visuals
12) Sound-alike Snippet
13) Mood Matching
14) Relationship / Inspiration Mapping
15) Life/Career Trivia
16) Timeline Ordering
17) Popularity Match
18) Longest Song
19) Tracklist Order
20) Guess the Era by Outfit
21) Lyric Mashups
22) Speed Tap
23) Reverse Audio
24) One Second Challenge
    Not always era-bound: Questions are tagged by themes (lyrics, charts, aesthetic, timeline, career, audio, …) and subjects (song:…, album:…, tour:…). Daily modes: mix (varied themes), spotlight (one theme), event.
    Subscriptions & One-offs
    • Basic: +120 s, 1× daily retry (on one question).
    • Premium: +240 s, 2× daily retries, Practice Mode (replay past sets; unranked).
    • One-offs: Restart (same questions reshuffled), Hints (per-question penalty).
    Anti-repeat Composition
    • Don’t reuse a question in daily quizzes for 30 days, relaxing if pool is too small: 30→21→14→10→7 (never below 7).
    • Bias toward least exposure (exposureCount ASC, lastUsedAt ASC).

---

6. Local-Time Drops (US/EU/CA/AU)
   6.1 TZ detection & user preferences
   • Capture IANA TZ (e.g., America/Toronto), UTC offset, country, persisted on profile.
   • Allow per-user evening window overrides (e.g., 17:00–21:00), with guardrails (min span 3h, no overnight).
   6.2 Scheduling options
   • Option A — Per-TZ minute (shared communal moment): One random minute per TZ/day (e.g., 19:37) for everyone in that TZ.
   • Option B — Per-user deterministic minute: Hash(userId + localDate) to assign a unique minute within the window → flatter load.
   Hybrid: Per-TZ minute ± deterministic per-user jitter (0–90 s) to smooth spikes while retaining a communal feel.
   6.3 Push dispatch
   • Devices subscribe to topics per TZ (and optionally per minute bucket).
   • Queue jobs per TZ (and per bucket if used); apply deterministic jitter per user when sending.
   6.4 Content identity & leaderboards
   • One global content template per calendar date (or per region if desired).
   • Daily leaderboards keyed by user local date (and TZ for regional views). Global daily can aggregate all local boards labeled for the same calendar date.
   6.5 DST & travel
   • IANA TZ ensures 18:00–22:00 remains an evening window across DST shifts.
   • TZ change takes effect next local day to prevent clock abuse.
   • Rapid oscillations flagged; freeze to last stable TZ for today if suspicious.

---

7. Detailed Requirements (SRS)
   7.1 Functional Requirements
   • FR-01 Local-time daily drop per user/TZ within configured window.
   • FR-02 1-hour join window; server rejects starts after expiry.
   • FR-03 Attempt start returns {attemptId, serverStartAt, deadline, seed, assignedJitterSec, templateUrl}; one active attempt/day unless restart is used.
   • FR-04 Questions delivered via CDN template (no answers); deterministic client shuffle with seed.
   • FR-05 Answers submitted per question or batch; idempotent; verified against deadline & seed.
   • FR-06 Finish → server scoring (incl. hint penalties), LBs update, attempt persisted.
   • FR-07 Leaderboards: global/season/daily/theme/region; APIs return top N + my rank.
   • FR-08 Subscriptions & one-offs: Stripe webhook → entitlements; entitlements granted at drop.
   • FR-09 Practice mode (Premium): past day sets; unranked.
   • FR-10 Admin CMS: CRUD questions, approvals, daily override, media uploads, moderation, stats.
   • FR-11 Anti-repeat composer with relaxation steps.
   • FR-12 Anti-cheat: server time, deterministic shuffle verification, rate limits, device integrity hints, replay protection.
   • FR-13 Content guardrails: no portrait/logo/masters; short/paraphrased lyrics; era-inspired visuals.
   7.2 Non-Functional Requirements
   • NFR-01 p95 read < 200 ms; p95 write < 400 ms during peak.
   • NFR-02 Scale to 10k–50k hourly users across regions.
   • NFR-03 99.9% API availability during 18:00–22:00 local windows.
   • NFR-04 Security: JWT, TLS, WAF, signed S3, least privilege.
   • NFR-05 Privacy: minimal PII, encryption at rest/in transit, GDPR-ready consent.
   • NFR-06 Observability: traces, metrics, logs with alerts on SLOs.
   • NFR-07 Testability: unit/integration/e2e + load testing.

---

8. Architecture
   8.1 Components
   [React Native App] ——\
    -> [NestJS API] -> [Postgres]
   [Next.js Admin] ——–/ [Redis (LBs/cache/queues)] -> [BullMQ]
   [S3 + CDN (template/media)]
   [FCM/APNs] [Stripe Webhooks]
   8.2 Hot paths & scale
   • Precompute & freeze the day’s CDN template at T-5 min per TZ.
   • /attempts/start → O(1): create attempt + return seed + template URL.
   • Deterministic shuffle client-side; server verifies by replaying seed.
   • Answers small; allow batch posting; scoring can be queued.
   8.3 Jobs (BullMQ)
   • composer:daily (T-60m): pick questions (no-repeat + diversity), persist DailyQuiz.
   • warmup:template (T-5m): render CDN template; set Redis key quiz:today.
   • grant:entitlements (drop): upsert DailyEntitlements including assignedJitterSec.
   • tz:fanout (drop): push per TZ (and per minute bucket if used).
   • scoring:attempt: finalize scores & update LBs.
   • snapshot:leaderboard (hourly/daily): persist top N.

---

9. Data Model (ER Outline)
   User(id, email, name, handle, country, tz, lastSeenOffset, lastSeenAt, notifWindowJSON, createdAt)
   Subscription(userId, plan: basic|premium, status, currentPeriodEnd)
   Purchase(id, userId, type: hint|restart|bundle, qty, status, createdAt)
   DailyEntitlements(userId, localDate, tz, assignedJitterSec, extraTimeSec, retriesGranted, retriesUsed, practiceGranted, practiceUsed, restartsGranted, restartsUsed, hintsGranted, hintsUsed, createdAt)
   Question(id, questionType, difficulty, themesJSON[], subjectsJSON[], promptJSON, choicesJSON, correctJSON, mediaJSON, approved, disabled, exposureCount, lastUsedAt, updatedAt)
   DailyQuiz(id, dropAtUTC, mode: mix|spotlight|event, themePlanJSON, templateVersion, templateCdnUrl, createdAt)
   DailyQuizQuestion(dailyQuizId, questionId, difficulty, questionType) — partitioned by date
   DailyDropTZ(id, localDate, tz, windowStart, windowEnd, chosenMinute, createdAt) — if Option A
   Attempt(id, userId, dailyQuizId, startAt, deadline, finishAt, answersJSON, accPoints, speedSec, earlySec, score, status) — partitioned by month
   PracticeAttempt(id, userId, dailyQuizId, startAt, finishAt, answersJSON, score, status)
   LeaderboardSnapshot(id, scope, key, date, topJSON)
   Indexes
   • Attempt(userId, dailyQuizId) unique (active lock)
   • Question(lastUsedAt, difficulty, exposureCount)
   • Redis ZSETs for LBs:
   o lb:daily:<localDate>:<tz> (regional)
   o lb:daily:<localDate>:global (aggregated)
   o lb:season:<S>
   o lb:theme:<theme>:season:<S>

---

10. API (Representative)
    Auth
    • POST /auth/login, POST /auth/refresh
    • POST /admin/auth/login (RBAC: owner|editor|moderator)
    Player — Daily
    • GET /daily →
    • {
    • "localDate":"2025-09-01",
    • "tz":"America/Toronto",
    • "window":{"start":"18:00","end":"22:00"},
    • "dropAtLocal":"2025-09-01T19:37:00",
    • "joinWindowEndsAtLocal":"2025-09-01T20:37:00",
    • "templateUrl":"https://cdn/quiz/2025-09-01/v4.json",
    • "templateVersion":4
    • }
    • POST /attempts/start → { attemptId, serverStartAt, deadline, seed, assignedJitterSec, templateUrl }
    • POST /attempts/:id/answer → accepts ResponseReq union (idempotent)
    • POST /attempts/:id/hint → consume hint; returns hint payload; apply penalty
    • POST /attempts/:id/retry → authorize retry for current question
    • POST /attempts/:id/restart → consume restart; abort previous; new seed & deadline
    • POST /attempts/:id/finish → returns breakdown + placement deltas
    Player — Leaderboards
    • GET /leaderboards?scope=global|daily|season&theme=&tz=&date=&limit=&cursor=
    • GET /leaderboards/me?scope=... → my rank, score, deltas
    Player — Practice (Premium)
    • GET /practice/past-days
    • POST /practice/start?dailyQuizId=...
    Admin — Content & Ops
    • POST /admin/questions
    • PATCH /admin/questions/:id (approve/disable/edit)
    • POST /admin/daily/compose (override)
    • GET /admin/stats (DAU, start/finish rate, avg score, item analysis)
    • GET /admin/drops (per TZ: chosen minute, push success, active tokens)
    Billing
    • POST /billing/checkout
    • POST /billing/webhook
    • GET /billing/entitlements
    Errors
    • 400 invalid, 401 unauthorized, 403 forbidden, 409 idempotency, 422 window expired, 429 rate limit, 500 server.

---

11. Composition & Anti-Repeat
    Relaxation strategy:
    • Start at 30 days; if pool < needed, step down: 30→21→14→10→7 (never < 7).
    • Weight sample by 1/(1+exposureCount); prefer long-unused items.
    • Partition DailyQuizQuestion by date; keep fast lookups for recent usage.
    Pseudo:
    const STEPS = [30,21,14,10,7];

function pickWithRelaxation(diff: "easy"|"medium"|"hard", need: number) {
for (const days of STEPS) {
const pool = repo.find({
approved: true, disabled: false, difficulty: diff,
lastUsedAt: lt(nowMinusDays(days))
}, { orderBy: ["exposureCount ASC", "lastUsedAt ASC"], limit: 200 });
if (pool.length >= need) return weightedSample(pool, need, q => 1/(1+q.exposureCount));
}
throw new Error("Insufficient pool");
}

---

12. Deterministic Shuffle & Jitter Fairness
    Template (CDN): prompt + choices (no answers), versioned & immutable.
    Seed (server): shared to client on start; both sides use same PRNG to shuffle questions & options.
    Jitter: per-user 0–90 s (deterministic hash(userId + localDate)), stored in DailyEntitlements.
    Early bonus uses effective start delay = (startAt - tzDropAt) - jitter.

---

13. Subscriptions, One-offs & Entitlements
    Plans
    • Basic: +120s, 1× retry/day
    • Premium: +240s, 2× retries/day, Practice mode
    One-offs
    • Restart (limit/day), Hints (packs)
    Entitlement grant (at drop)
    • Upsert DailyEntitlements{ userId, localDate, tz, assignedJitterSec, extraTimeSec, retriesGranted, practiceGranted, … }
    • Consume at runtime (retry/hint/restart endpoints).

---

14. Leaderboards
    • Redis ZSETs:
    o lb:daily:<localDate>:<tz> (regional daily)
    o lb:daily:<localDate>:global (aggregated)
    o lb:season:<S> (global)
    o lb:theme:<theme>:season:<S> (theme)
    • On finish: ZADD daily, ZINCRBY season. Keep highest daily per user.
    • Hourly/daily snapshots → Postgres.

---

15. Security, Anti-Cheat, Compliance
    • Server time is authority; client timers are cosmetic.
    • Deterministic shuffle verification (seed/optionOrder hash).
    • No answers in client template; only on server.
    • Idempotency keys, rate limits, WAF.
    • Device integrity hints (root/jailbreak), IP anomaly scoring → soft flags.
    • Nightly recompute from append-only logs for auditability.
    • Legal/IP: avoid portraits/logos/masters; short/paraphrased lyrics; era-inspired visuals only; takedown workflow.

---

16. Observability & SLOs
    • OpenTelemetry traces; metrics on RPS, p95, error rates, Redis ops, queue latency, push success (%).
    • Alerts on SLO breach, queue backlog, error spikes.
    • PII-redacted structured logs with correlation IDs.

---

17. Testing & QA
    • Unit: validators (Question/Response), scoring (incl. jitter), entitlements state machine.
    • Integration: /attempts lifecycle; Stripe webhook → entitlements; composer anti-repeat.
    • E2E: full daily flow with retries/hints/restart; practice mode.
    • Load: simulate largest TZ spike (5k starts in 3 min; 10k in hour).
    • Content QA: admin preview with seed to verify shuffles and choices.
    Acceptance samples
    • AC-1: Question used on Day D not reused before D+7 (target 30; relax if needed).
    • AC-2: Early bonus uses jitter-adjusted delay.
    • AC-3: Speed bonus normalized to 600s regardless of extra time.
    • AC-4: Latest finished attempt only affects LBs after a restart.
    • AC-5: Peak TZ p95 /attempts/start < 300 ms with 5k starts/3 min.

---

18. Deployment & Environments
    • Envs: dev / staging / prod (isolated DB/Redis/buckets).
    • Multi-region API (at least NA/EU/APAC) behind global LB; CDN edge cache for templates/media.
    • Managed Redis (AOF) and Postgres (with pgBouncer).
    • Blue/green or rolling deploy; feature flags for risky features.
    • DB migrations (TypeORM) backward compatible; template version bump for cache bust.

---

19. Rollout Plan
    MVP (Weeks 1–4)
    • 10 question types; composer; CDN template; scoring; LBs; basic anti-cheat.
    • Admin CRUD; S3 uploader; approval flow.
    • Stripe subs (Basic/Premium); entitlements grant; local-time drops for 1–2 TZs.
    V1.0 (Weeks 5–8)
    • All 19 question types; retries/hints/restart; practice mode.
    • Themed & regional LBs; analytics dashboards; load test across US/EU/CA/AU.
    V1.1 (this doc)
    • Full local-time support (per-TZ minute + per-user jitter), fairness scoring, travel/DST rules, admin TZ dashboards.

---

20. Key Artifacts
    20.1 Question Interfaces (TypeScript)
    export type Difficulty = "easy" | "medium" | "hard";
    export type MediaRef = { type: "image" | "audio"; url: string; };
    export type QuestionType =
    | "album_year_guess" | "song_album_match" | "fill_blank" | "guess_by_lyric"
    | "odd_one_out" | "ai_visual" | "sound_alike_snippet" | "mood_match"
    | "inspiration_map" | "life_trivia" | "timeline_order" | "popularity_match"
    | "longest_song" | "tracklist_order" | "outfit_era" | "lyric_mashup"
    | "speed_tap" | "reverse_audio" | "one_second";

export interface BasicQuestion {
id: string;
questionType: QuestionType;
difficulty: Difficulty;
themes: string[];
subjects: string[];
prompt: any;
choices?: string[];
correct: any;
mediaRefs?: MediaRef[];
scoringHints?: Record<string, any>;
}

export interface AlbumYearGuessQuestion extends BasicQuestion {
questionType: "album_year_guess";
prompt: { task: string; album: string; };
choices: string[]; correct: number;
}
export interface SongAlbumMatchQuestion extends BasicQuestion {
questionType: "song_album_match";
prompt: { task: string; left: string[]; right: string[]; };
correct: Record<string, string>;
}
export interface FillBlankQuestion extends BasicQuestion {
questionType: "fill_blank";
prompt: { task: string; text: string; };
choices: string[]; correct: number;
}
export interface GuessByLyricQuestion extends BasicQuestion {
questionType: "guess_by_lyric";
prompt: { task: string; lyric: string; };
choices: string[]; correct: number;
}
export interface OddOneOutQuestion extends BasicQuestion {
questionType: "odd_one_out";
prompt: { task: string; setRule: string; };
choices: string[]; correct: number;
}
export interface AiVisualQuestion extends BasicQuestion {
questionType: "ai_visual";
prompt: { task: string; };
mediaRefs: MediaRef[]; choices: string[]; correct: number;
}
export interface SoundAlikeSnippetQuestion extends BasicQuestion {
questionType: "sound_alike_snippet";
prompt: { task: string; };
mediaRefs: MediaRef[]; choices: string[]; correct: number;
}
export interface MoodMatchQuestion extends BasicQuestion {
questionType: "mood_match";
prompt: { task: string; moodTags: string[]; note?: string; };
mediaRefs: MediaRef[]; choices: string[]; correct: number;
}
export interface InspirationMapQuestion extends BasicQuestion {
questionType: "inspiration_map";
prompt: { task: string; disclaimer?: string; };
choices: string[]; correct: number;
}
export interface LifeTriviaQuestion extends BasicQuestion {
questionType: "life_trivia";
prompt: { task: string; question: string; };
choices: string[]; correct: number;
}
export interface TimelineOrderQuestion extends BasicQuestion {
questionType: "timeline_order";
prompt: { task: string; items: string[]; };
correct: string[];
}
export interface PopularityMatchQuestion extends BasicQuestion {
questionType: "popularity_match";
prompt: { task: string; asOf: string; };
choices: string[]; correct: string[];
}
export interface LongestSongQuestion extends BasicQuestion {
questionType: "longest_song";
prompt: { task: string; };
choices: string[]; correct: number;
}
export interface TracklistOrderQuestion extends BasicQuestion {
questionType: "tracklist_order";
prompt: { task: string; album: string; tracks: string[]; };
correct: string[];
}
export interface OutfitEraQuestion extends BasicQuestion {
questionType: "outfit_era";
prompt: { task: string; };
mediaRefs: MediaRef[]; choices: string[]; correct: number;
}
export interface LyricMashupQuestion extends BasicQuestion {
questionType: "lyric_mashup";
prompt: { task: string; snippets: string[]; optionsPerSnippet: string[]; };
correct: Record<string, string>;
}
export interface SpeedTapQuestion extends BasicQuestion {
questionType: "speed_tap";
prompt: { task: string; targetRule: string; roundSeconds: number; grid: string[]; };
correct: { targets: string[] };
scoringHints?: { perCorrect: number; perWrong: number };
}
export interface ReverseAudioQuestion extends BasicQuestion {
questionType: "reverse_audio";
prompt: { task: string; };
mediaRefs: MediaRef[]; choices: string[]; correct: number;
}
export interface OneSecondQuestion extends BasicQuestion {
questionType: "one_second";
prompt: { task: string; };
mediaRefs: MediaRef[]; choices: string[]; correct: number;
}

export type AnyQuestion =
| AlbumYearGuessQuestion | SongAlbumMatchQuestion | FillBlankQuestion | GuessByLyricQuestion
| OddOneOutQuestion | AiVisualQuestion | SoundAlikeSnippetQuestion | MoodMatchQuestion
| InspirationMapQuestion | LifeTriviaQuestion | TimelineOrderQuestion | PopularityMatchQuestion
| LongestSongQuestion | TracklistOrderQuestion | OutfitEraQuestion | LyricMashupQuestion
| SpeedTapQuestion | ReverseAudioQuestion | OneSecondQuestion;
20.2 Response Request Interfaces (TypeScript)
export interface BasicResponseReq {
attemptId: string;
questionId: string;
clientSentAt?: number;
timeSpentMs?: number;
usedHint?: boolean;
isRetry?: boolean;
shuffleProof?: { seed?: string; optionOrderHash?: string };
idempotencyKey?: string;
}
export type QuestionType =
| "album_year_guess" | "song_album_match" | "fill_blank" | "guess_by_lyric"
| "odd_one_out" | "ai_visual" | "sound_alike_snippet" | "mood_match"
| "inspiration_map" | "life_trivia" | "timeline_order" | "popularity_match"
| "longest_song" | "tracklist_order" | "outfit_era" | "lyric_mashup"
| "speed_tap" | "reverse_audio" | "one_second";

export interface AlbumYearGuessResponseReq extends BasicResponseReq { questionType:"album_year_guess"; answer:{choiceIndex:number}; }
export interface SongAlbumMatchResponseReq extends BasicResponseReq { questionType:"song_album_match"; answer:Record<string,string>; }
export interface FillBlankResponseReq extends BasicResponseReq { questionType:"fill_blank"; answer:{choiceIndex:number}; }
export interface GuessByLyricResponseReq extends BasicResponseReq { questionType:"guess_by_lyric"; answer:{choiceIndex:number}; }
export interface OddOneOutResponseReq extends BasicResponseReq { questionType:"odd_one_out"; answer:{choiceIndex:number}; }
export interface AiVisualResponseReq extends BasicResponseReq { questionType:"ai_visual"; answer:{choiceIndex:number}; }
export interface SoundAlikeSnippetResponseReq extends BasicResponseReq { questionType:"sound_alike_snippet"; answer:{choiceIndex:number}; }
export interface MoodMatchResponseReq extends BasicResponseReq { questionType:"mood_match"; answer:{choiceIndex:number}; }
export interface InspirationMapResponseReq extends BasicResponseReq { questionType:"inspiration_map"; answer:{choiceIndex:number}; }
export interface LifeTriviaResponseReq extends BasicResponseReq { questionType:"life_trivia"; answer:{choiceIndex:number}; }
export interface TimelineOrderResponseReq extends BasicResponseReq { questionType:"timeline_order"; answer:{orderedItems:string[]}; }
export interface PopularityMatchResponseReq extends BasicResponseReq { questionType:"popularity_match"; answer:{orderedChoices:string[]}; }
export interface LongestSongResponseReq extends BasicResponseReq { questionType:"longest_song"; answer:{choiceIndex:number}; }
export interface TracklistOrderResponseReq extends BasicResponseReq { questionType:"tracklist_order"; answer:{orderedTracks:string[]}; }
export interface OutfitEraResponseReq extends BasicResponseReq { questionType:"outfit_era"; answer:{choiceIndex:number}; }
export interface LyricMashupResponseReq extends BasicResponseReq { questionType:"lyric_mashup"; answer:Record<string,string>; }
export interface SpeedTapResponseReq extends BasicResponseReq {
questionType:"speed_tap";
answer:{ roundSeconds:number; events:Array<{ts:number; option:string; action:"tap"|"undo"}>; clientSummary?:{taps:number; correct:number; wrong:number} };
}
export interface ReverseAudioResponseReq extends BasicResponseReq { questionType:"reverse_audio"; answer:{choiceIndex:number}; }
export interface OneSecondResponseReq extends BasicResponseReq { questionType:"one_second"; answer:{choiceIndex:number}; }

export type AnyResponseReq =
| AlbumYearGuessResponseReq | SongAlbumMatchResponseReq | FillBlankResponseReq | GuessByLyricResponseReq
| OddOneOutResponseReq | AiVisualResponseReq | SoundAlikeSnippetResponseReq | MoodMatchResponseReq
| InspirationMapResponseReq | LifeTriviaResponseReq | TimelineOrderResponseReq | PopularityMatchResponseReq
| LongestSongResponseReq | TracklistOrderResponseReq | OutfitEraResponseReq | LyricMashupResponseReq
| SpeedTapResponseReq | ReverseAudioResponseReq | OneSecondResponseReq;
20.3 CDN Template & Shuffle
{
"dailyQuizId": "dq_2025-09-01",
"version": 4,
"questions": [
{ "qid": "q1", "type": "album_year_guess", "payload": { "task": "...", "album": "...", "choices": ["..."] } },
{ "qid": "q2", "type": "mood_match", "payload": { "task": "...", "moodTags": ["..."], "choices": ["..."], "media": ["..."] } }
],
"clientShuffle": { "algo": "xorshift", "fields": ["questions", "choices"] }
}
Deterministic helpers (shared lib):
function chooseTzMinute(tz: string, localDate: string, winStart="18:00", winEnd="22:00") { /_ hash(tz+date)%window _/ }
function userJitterSec(userId: string, localDate: string) { return hash(userId + "|" + localDate) % 91; }
function effectiveStartDelaySec(serverStartAt: Date, tzDropAt: Date, jitterSec: number) {
return Math.max(0, (serverStartAt.getTime() - tzDropAt.getTime())/1000 - jitterSec);
}

---

21. Risks & Mitigations
    • Thundering herd → Per-TZ minute + per-user jitter, CDN template, horizontal API, rate limits.
    • Pool exhaustion → Relaxation steps, content velocity dashboards, community submissions (moderated).
    • Clock/TZ abuse → Next-day TZ change effect, anomaly flags, freeze rules.
    • Copyright/IP → Strict guidelines; takedown process; admin checks.
    • Payment edge cases → Idempotent webhooks; entitlement grants at drop; clear UX when active attempt exists.

---

22. Go-Live Checklist
    • TZ/local window scheduling live for US/EU/CA/AU; admin can view per-TZ minute.
    • assignedJitterSec stored and used in early bonus.
    • CDN template warmup at T-5 min per TZ; immutable versioned URLs.
    • Anti-repeat ≥7 days (target 30) with relaxation & exposure bias.
    • Subscriptions & entitlements grant at drop; retries/hints/restart flows working.
    • LBs stable; snapshots persisted; regional & global daily visible.
    • Observability dashboards & alerts configured; load tests meet SLOs.

---

If you want, I can now produce:
• TypeORM entities & migrations for DailyDropTZ, DailyEntitlements, DailyQuiz\*, Question, Attempt, Subscription,
• NestJS services for TZ planning, template warmup, entitlements, and composer,
• k6 scripts simulating multiple TZs (US/EU/CA/AU) with jittered pushes and spike starts.
